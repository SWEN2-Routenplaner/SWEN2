package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import at.fhtw.tourplanner.presentation.dto.request.RoutePreviewRequest;
import at.fhtw.tourplanner.presentation.dto.response.RoutePreviewResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class RouteService {

    private final RestClient restClient;

    public RoutePreviewResponse preview(RoutePreviewRequest request) {
        log.debug("Route preview requested from '{}' to '{}' via {}",
                request.from(), request.to(), request.transportType());
        // call OpenRouteService and return result
        return callOpenRouteService(request.from(), request.to(), request.transportType().name());
    }

    /*
     *  Mutates the domain model in place before saving it
     * */

    // TODO: adjust whatever is needed for the frontend (bounding box etc.)
    public void createRoute(TourEntity tour) {
        log.debug("Calculating route from '{}' to '{}' via {}",
                tour.getFromLocation(), tour.getToLocation(), tour.getTransportType());
        RoutePreviewResponse route = callOpenRouteService(
                tour.getFromLocation(), tour.getToLocation(), tour.getTransportType().name());
        tour.setDistance(route.distance());
        tour.setEstimatedTime(route.estimatedTime());
        tour.setRouteInformation(route.routeInformation());
    }

    private RoutePreviewResponse callOpenRouteService(String from, String to, String transport) {
        // TODO: implement actual OpenRouteService HTTP call (Jonas)
        // TEMPORARY PLACEHOLDER so tour CRUD is testable until ORS is wired up.
        log.warn("OpenRouteService not implemented — returning placeholder route for '{}' -> '{}' via {}",
                from, to, transport);
        return new RoutePreviewResponse(0.0, 0L, "PLACEHOLDER: route not computed (ORS integration pending)");
    }
}
