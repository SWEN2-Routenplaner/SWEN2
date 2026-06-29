package at.fhtw.tourplanner.business.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * Stores tour images on the filesystem (outside the database, as required by the
 * project specification). The database only keeps the relative file name; the
 * actual binary lives under the configured base directory.
 */
@Slf4j
@Service
public class ImageStorageService {

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/png", ".png",
            "image/jpeg", ".jpg",
            "image/gif", ".gif",
            "image/webp", ".webp"
    );

    private final Path baseDir;

    public ImageStorageService(@Value("${tourplanner.image-storage.base-dir}") String baseDir) {
        this.baseDir = Paths.get(baseDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(baseDir);
            log.info("Tour image storage directory: {}", baseDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create image storage directory: " + baseDir, e);
        }
    }

    /**
     * Persists the uploaded picture on the filesystem
     */
    public String store(Long tourId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file must not be empty");
        }
        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unsupported image type: " + file.getContentType() + ". Allowed: " + ALLOWED_TYPES.keySet());
        }

        String fileName = "tour-" + tourId + "-" + UUID.randomUUID() + extension;
        Path target = baseDir.resolve(fileName).normalize();
        if (!target.startsWith(baseDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid target path");
        }

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored image for tour id={} at {}", tourId, target);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store image for tour id=" + tourId, e);
        }
        return fileName;
    }

    /**
     * Loads a previously stored image
     */
    public Resource load(String fileName) {
        Path target = baseDir.resolve(fileName).normalize();
        if (!target.startsWith(baseDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image path");
        }
        try {
            Resource resource = new UrlResource(target.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image file not found");
            }
            return resource;
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read image: " + fileName, e);
        }
    }

    /**
     * Removes a stored image
     */
    public void delete(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return;
        }
        Path target = baseDir.resolve(fileName).normalize();
        if (!target.startsWith(baseDir)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Could not delete old image {}: {}", fileName, e.getMessage());
        }
    }

    public String probeContentType(String fileName) {
        Path target = baseDir.resolve(fileName).normalize();
        try {
            String type = Files.probeContentType(target);
            return type != null ? type : "application/octet-stream";
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }
}
