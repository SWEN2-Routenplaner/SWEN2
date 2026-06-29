package at.fhtw.tourplanner.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record TourLogCreateRequest (
        @NotNull LocalDateTime dateTime,
        String comment,
        @Min(1) @Max(5) Integer difficulty,
        @Positive Double totalDistance,
        @Positive Long totalTime,
        @Min(1) @Max(5) Integer rating
) {}
