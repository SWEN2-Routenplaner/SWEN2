package at.fhtw.tourplanner.presentation.dto.response;

import at.fhtw.tourplanner.business.model.TransportType;

public record TourResponse(
        Long id,
        String name,
        String description,
        String from,
        String to,
        TransportType transportType,
        Double distance,
        Long estimatedDuration,
        String routeInformation
)
{}
