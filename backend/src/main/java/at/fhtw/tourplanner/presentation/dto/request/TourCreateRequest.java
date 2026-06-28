package at.fhtw.tourplanner.presentation.dto.request;

import at.fhtw.tourplanner.business.model.TransportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TourCreateRequest(
        @NotBlank String name,
        String description,
        @NotBlank String from,
        @NotBlank String to,
        @NotNull TransportType transportType
) {
}
