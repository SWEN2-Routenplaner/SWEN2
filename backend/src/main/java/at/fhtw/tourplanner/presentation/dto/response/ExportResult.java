package at.fhtw.tourplanner.presentation.dto.response;


import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;

public record ExportResult(
        Resource resource,
        MediaType mediaType
) {
}
