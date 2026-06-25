package at.fhtw.tourplanner.business.mapper;

import at.fhtw.tourplanner.business.model.Tour;
import at.fhtw.tourplanner.presentation.dto.request.TourCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/*
* The Mapper ensures that the Services work on the domain models
* and only call mappers at the edges. Services never touch DTOs directly for logic.
* */

@Component
@RequiredArgsConstructor
public class TourMapper {
    public TourResponse toResponse(Tour tour) {
        return new TourResponse(
                tour.getId(),
                tour.getName(),
                tour.getDescription(),
                tour.getFrom(),
                tour.getTo(),
                tour.getTransportType(),
                tour.getDistance(),
                tour.getEstimatedDuration(),
                tour.getRouteInformation()
        );
    }

    public Tour toDomain(TourCreateRequest request) {
        Tour tour = new Tour();
        tour.setName(request.name());
        tour.setDescription(request.description());
        tour.setFrom(request.from());
        tour.setTo(request.to());
        tour.setTransportType(request.transportType());
        tour.setDistance(request.distance());
        tour.setEstimatedDuration(request.estimatedDuration());
        return tour;
    }

    public void updateDomain(Tour existing, @Valid TourCreateRequest request) {
        existing.setName(request.name());
        existing.setDescription(request.description());
        existing.setFrom(request.from());
        existing.setTo(request.to());
        existing.setTransportType(request.transportType());
        existing.setDistance(request.distance());
        existing.setEstimatedDuration(request.estimatedDuration());
    }
}
