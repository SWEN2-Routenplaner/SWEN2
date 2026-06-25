package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.business.model.Tour;
import at.fhtw.tourplanner.presentation.dto.request.RoutePreviewRequest;
import at.fhtw.tourplanner.presentation.dto.response.RoutePreviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RestClient restClient;

    public RoutePreviewResponse preview(RoutePreviewRequest request) {
        // call OpenRouteService and return result
        return callOpenRouteService(request.from(), request.to(), request.transportType().name());
    }

    /*
     *  Mutates the domain model in place before saving it
     * */

    // TODO: adjust whatever is needed for the frontend (bounding box etc.)
    public void createRoute(Tour tour) {
        RoutePreviewResponse route = callOpenRouteService(
                tour.getFrom(), tour.getTo(), tour.getTransportType().name());
        tour.setDistance(route.distance());
        tour.setEstimatedDuration(route.estimatedTime());
        tour.setRouteInformation(route.routeInformation());
    }

    private RoutePreviewResponse callOpenRouteService(String from, String to, String transport) {
        // TODO: implement actual OpenRouteService HTTP call (Jonas)
        throw new UnsupportedOperationException("OpenRouteService integration not yet implemented");
    }
}
