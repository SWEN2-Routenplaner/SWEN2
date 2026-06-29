package at.fhtw.tourplanner.presentation.dto.response;

import java.util.List;

public record SearchResponse(
        List<TourResponse> tours,
        List<TourLogResponse> tourLogs
) {
}
