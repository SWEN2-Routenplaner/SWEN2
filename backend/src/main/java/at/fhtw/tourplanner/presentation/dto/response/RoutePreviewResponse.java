package at.fhtw.tourplanner.presentation.dto.response;

public record RoutePreviewResponse(
        Double distance,
        Long estimatedTime,
        String routeInformation
) {
}
