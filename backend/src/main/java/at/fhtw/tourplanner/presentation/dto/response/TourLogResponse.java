package at.fhtw.tourplanner.presentation.dto.response;

import java.time.LocalDateTime;

public record TourLogResponse(
        Long id,
        LocalDateTime dateTime,
        String comment,
        Integer difficulty,
        Double totalDistance,
        Long totalTime,
        Integer rating
) {
}
