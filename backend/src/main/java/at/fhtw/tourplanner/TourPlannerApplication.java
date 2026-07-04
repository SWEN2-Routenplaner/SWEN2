package at.fhtw.tourplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class TourPlannerApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(TourPlannerApplication.class, args);
	}

	private static void loadDotEnv() {
		File envFile = findDotEnv(new File(".").getAbsoluteFile(), 0);
		if (envFile != null && envFile.exists()) {
			try {
				List<String> lines = Files.readAllLines(envFile.toPath());
				for (String line : lines) {
					line = line.trim();
					if (line.isEmpty() || line.startsWith("#")) {
						continue;
					}
					int eqIndex = line.indexOf('=');
					if (eqIndex > 0) {
						String key = line.substring(0, eqIndex).trim();
						String value = line.substring(eqIndex + 1).trim();
						if ((value.startsWith("\"") && value.endsWith("\"")) ||
							(value.startsWith("'") && value.endsWith("'"))) {
							value = value.substring(1, value.length() - 1);
						}
						String existingEnv = System.getenv(key);
						String existingProp = System.getProperty(key);
						boolean isEmptyEnv = existingEnv == null || existingEnv.trim().isEmpty();
						boolean isEmptyProp = existingProp == null || existingProp.trim().isEmpty();
						if (isEmptyEnv && isEmptyProp) {
							System.setProperty(key, value);
						}
					}
				}
				System.out.println("Loaded environment variables from: " + envFile.getAbsolutePath());
			} catch (IOException e) {
				System.err.println("Failed to read .env file: " + e.getMessage());
			}
		}
	}

	private static File findDotEnv(File dir, int depth) {
		if (depth > 3 || dir == null) {
			return null;
		}
		File file = new File(dir, ".env");
		if (file.exists()) {
			return file;
		}
		return findDotEnv(dir.getParentFile(), depth + 1);
	}
}
