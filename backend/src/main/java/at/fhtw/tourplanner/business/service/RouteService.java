package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import at.fhtw.tourplanner.presentation.dto.request.RoutePreviewRequest;
import at.fhtw.tourplanner.presentation.dto.response.RoutePreviewResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RouteService {

    private final RestClient restClient;

    @Value("${openrouteservice.api-key:}")
    private String apiKey;

    public RoutePreviewResponse preview(RoutePreviewRequest request) {
        log.debug("Route preview requested from '{}' to '{}' via {}",
                request.from(), request.to(), request.transportType());
        return callOpenRouteService(request.from(), request.to(), request.transportType().name());
    }

    /**
     * Mutates the domain model in place before saving it
     */
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
        log.info("Calling OpenRouteService for route '{}' -> '{}' via {}", from, to, transport);

        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("OpenRouteService API key is missing. Returning mock route calculations for development/testing.");
            double distanceKm = 5.0 + (from.length() + to.length()) * 1.2;
            long durationSeconds = (long)(distanceKm * 75); // ~1.25 minutes per km
            return new RoutePreviewResponse(distanceKm, durationSeconds, "PLACEHOLDER: mock route geometry");
        }

        // 1. Geocode "from" address to coordinates
        double[] startCoords = geocodeAddress(from);
        if (startCoords == null) {
            throw new IllegalArgumentException("Could not resolve starting location: " + from);
        }

        // 2. Geocode "to" address to coordinates
        double[] endCoords = geocodeAddress(to);
        if (endCoords == null) {
            throw new IllegalArgumentException("Could not resolve destination location: " + to);
        }

        // 3. Map transport mode to ORS profile
        String profile = resolveProfile(transport);

        // 4. Request directions from ORS
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("coordinates", List.of(
                List.of(startCoords[0], startCoords[1]),
                List.of(endCoords[0], endCoords[1])
        ));

        try {
            Map<?, ?> response = restClient.post()
                    .uri("/v2/directions/{profile}", profile)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("routes")) {
                List<?> routes = (List<?>) response.get("routes");
                if (!routes.isEmpty()) {
                    Map<?, ?> route = (Map<?, ?>) routes.get(0);
                    Map<?, ?> summary = (Map<?, ?>) route.get("summary");

                    Double distanceMeters = 0.0;
                    Long durationSeconds = 0L;
                    String geometry = "";

                    if (summary != null) {
                        if (summary.containsKey("distance")) {
                            distanceMeters = ((Number) summary.get("distance")).doubleValue();
                        }
                        if (summary.containsKey("duration")) {
                            durationSeconds = ((Number) summary.get("duration")).longValue();
                        }
                    }

                    if (route.containsKey("geometry")) {
                        geometry = (String) route.get("geometry");
                    }

                    // Convert distance from meters to kilometers (double)
                    double distanceKm = distanceMeters / 1000.0;

                    log.debug("Successfully calculated route: distance={} km, duration={} s", distanceKm, durationSeconds);
                    return new RoutePreviewResponse(distanceKm, durationSeconds, geometry);
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch directions from OpenRouteService for profile {}", profile, e);
            throw new RuntimeException("OpenRouteService Directions API call failed: " + e.getMessage(), e);
        }

        throw new RuntimeException("OpenRouteService Directions API returned no routes");
    }

    private double[] geocodeAddress(String address) {
        log.debug("Geocoding address: {}", address);
        try {
            Map<?, ?> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/geocode/search")
                            .queryParam("text", address)
                            .queryParam("size", 1)
                            .build())
                    .header("Authorization", apiKey)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("features")) {
                List<?> features = (List<?>) response.get("features");
                if (!features.isEmpty()) {
                    Map<?, ?> firstFeature = (Map<?, ?>) features.get(0);
                    Map<?, ?> geometry = (Map<?, ?>) firstFeature.get("geometry");
                    if (geometry != null && geometry.containsKey("coordinates")) {
                        List<?> coordinates = (List<?>) geometry.get("coordinates");
                        if (coordinates.size() >= 2) {
                            double lon = ((Number) coordinates.get(0)).doubleValue();
                            double lat = ((Number) coordinates.get(1)).doubleValue();
                            log.debug("Geocoded '{}' to [{}, {}]", address, lon, lat);
                            return new double[]{lon, lat};
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to geocode address: {}", address, e);
        }
        return null;
    }

    private String resolveProfile(String transport) {
        if (transport == null) {
            return "driving-car";
        }
        return switch (transport.toUpperCase()) {
            case "BIKE", "BICYCLE" -> "cycling-regular";
            case "WALK", "FOOT", "HIKING" -> "foot-walking";
            default -> "driving-car";
        };
    }
}
