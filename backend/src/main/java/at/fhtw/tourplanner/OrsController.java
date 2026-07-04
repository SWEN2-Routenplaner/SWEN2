package at.fhtw.tourplanner;

import at.fhtw.tourplanner.business.service.RouteService;
import at.fhtw.tourplanner.presentation.dto.request.RoutePreviewRequest;
import at.fhtw.tourplanner.presentation.dto.response.RoutePreviewResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class OrsController {

    private final OrsService orsService;
    private final RouteService routeService;

    public OrsController(OrsService orsService, RouteService routeService) {
        this.orsService = orsService;
        this.routeService = routeService;
    }

    /**
     * Preview a route without saving, returning distance, estimated time, and route geometry.
     * POST /api/routes/preview
     */
    @PostMapping("/routes/preview")
    public ResponseEntity<?> previewRoute(@RequestBody RoutePreviewRequest request) {
        try {
            RoutePreviewResponse result = routeService.preview(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to preview route", "message", e.getMessage()));
        }
    }

    /**
     * Reverse geocode a coordinate to a human-readable location label.
     * GET /api/geocode/reverse
     */
    @GetMapping("/geocode/reverse")
    public ResponseEntity<?> reverseGeocode(@RequestParam double lon, @RequestParam double lat) {
        try {
            String label = orsService.reverseGeocode(lon, lat);
            return ResponseEntity.ok(Map.of("label", label));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reverse geocode coordinate", "message", e.getMessage()));
        }
    }


    /**
     * Search POIs using a full ORS POI payload.
     * POST /api/pois
     */
    @PostMapping("/pois")
    public ResponseEntity<?> searchPois(@RequestBody Map<String, Object> requestBody) {
        try {
            Object result = orsService.searchPois(requestBody);
            return ResponseEntity.ok(result);
        } catch (RestClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(e.getResponseBodyAs(Map.class));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search POIs", "message", e.getMessage()));
        }
    }

    /**
     * Search POIs around a single point with a given buffer (radius in meters).
     * GET /api/pois
     */
    @GetMapping("/pois")
    public ResponseEntity<?> searchPoisSimple(
            @RequestParam double lon,
            @RequestParam double lat,
            @RequestParam(required = false) Integer buffer) {
        try {
            Object result = orsService.searchPoisSimple(lon, lat, buffer);
            return ResponseEntity.ok(result);
        } catch (RestClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(e.getResponseBodyAs(Map.class));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search POIs", "message", e.getMessage()));
        }
    }

    /**
     * Search route by profile using full ORS directions request body.
     * POST /api/routes/{profile}
     */
    @PostMapping("/routes/{profile}")
    public ResponseEntity<?> searchRoute(
            @PathVariable String profile,
            @RequestBody Map<String, Object> requestBody) {
        try {
            Object result = orsService.searchRoute(profile, requestBody);
            return ResponseEntity.ok(result);
        } catch (RestClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(e.getResponseBodyAs(Map.class));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to calculate route", "message", e.getMessage()));
        }
    }

    /**
     * Search route between start and end coordinates with optional profile.
     * GET /api/routes
     */
    @GetMapping("/routes")
    public ResponseEntity<?> searchRouteSimple(
            @RequestParam double startLon,
            @RequestParam double startLat,
            @RequestParam double endLon,
            @RequestParam double endLat,
            @RequestParam(required = false, defaultValue = "driving-car") String profile) {
        try {
            Object result = orsService.searchRouteSimple(startLon, startLat, endLon, endLat, profile);
            return ResponseEntity.ok(result);
        } catch (RestClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(e.getResponseBodyAs(Map.class));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to calculate route", "message", e.getMessage()));
        }
    }

    /**
     * Proxies the Overpass API query for map place labels.
     * GET /api/map/places
     */
    @GetMapping("/map/places")
    public ResponseEntity<?> getMapPlaces(
            @RequestParam double minLat,
            @RequestParam double minLon,
            @RequestParam double maxLat,
            @RequestParam double maxLon,
            @RequestParam int zoom) {
        try {
            Object result = orsService.fetchMapPlaces(minLat, minLon, maxLat, maxLon, zoom);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch map places", "message", e.getMessage()));
        }
    }
}
