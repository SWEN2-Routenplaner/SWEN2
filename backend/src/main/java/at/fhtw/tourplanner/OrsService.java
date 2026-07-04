package at.fhtw.tourplanner;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrsService {

    private static final Logger logger = LoggerFactory.getLogger(OrsService.class);

    private final RestClient restClient;

    @Value("${openrouteservice.api-key:}")
    private String apiKey;

    public OrsService(@Value("${openrouteservice.base-url:https://api.openrouteservice.org}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    /**
     * Reverse geocode coordinates to a human-readable location name (locality/village/etc.).
     */
    public String reverseGeocode(double lon, double lat) {
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                logger.info("Reverse geocoding coordinate [lon: {}, lat: {}] via OpenRouteService", lon, lat);
                Map<?, ?> response = restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/geocode/reverse")
                                .queryParam("api_key", apiKey)
                                .queryParam("point.lon", lon)
                                .queryParam("point.lat", lat)
                                .queryParam("layers", "locality,localadmin,borough,coarse")
                                .queryParam("size", 1)
                                .build())
                        .retrieve()
                        .body(Map.class);

                if (response != null && response.containsKey("features")) {
                    List<?> features = (List<?>) response.get("features");
                    if (!features.isEmpty()) {
                        Map<?, ?> feature = (Map<?, ?>) features.get(0);
                        Map<?, ?> properties = (Map<?, ?>) feature.get("properties");
                        if (properties != null) {
                            // Prioritize city/town/village names
                            if (properties.containsKey("locality")) {
                                return (String) properties.get("locality");
                            } else if (properties.containsKey("village")) {
                                return (String) properties.get("village");
                            } else if (properties.containsKey("borough")) {
                                return (String) properties.get("borough");
                            } else if (properties.containsKey("county")) {
                                return (String) properties.get("county");
                            } else if (properties.containsKey("name")) {
                                return (String) properties.get("name");
                            } else if (properties.containsKey("label")) {
                                return (String) properties.get("label");
                            }
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to reverse geocode coordinate [lon: {}, lat: {}]: {}", lon, lat, e.getMessage());
            }
        } else {
            logger.warn("OpenRouteService API key is missing. Using coordinates as fallback.");
        }

        // Return a clean coordinates string if geocoding fails or key is missing
        return String.format("Location (%.4f, %.4f)", lat, lon);
    }

    /**
     * Search POIs by forwarding the raw request body to OpenRouteService.
     */
    public Object searchPois(Map<String, Object> requestBody) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("OpenRouteService API key is missing. Returning empty POIs.");
            return Map.of("type", "FeatureCollection", "features", List.of());
        }
        logger.info("Forwarding POI search request to OpenRouteService");
        try {
            return restClient.post()
                    .uri("/pois")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(Object.class);
        } catch (RestClientResponseException e) {
            logger.error("Error calling OpenRouteService POI endpoint: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        }
    }

    /**
     * Search route by profile and forwarding the raw request body to OpenRouteService.
     */
    public Object searchRoute(String profile, Map<String, Object> requestBody) {
        logger.info("Forwarding route search request to OpenRouteService for profile: {}", profile);
        try {
            return restClient.post()
                    .uri("/v2/directions/{profile}", profile)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(Object.class);
        } catch (RestClientResponseException e) {
            logger.error("Error calling OpenRouteService directions endpoint for profile {}: {} - {}", profile, e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        }
    }

    /**
     * Simplified POI search around coordinates.
     */
    public Object searchPoisSimple(double lon, double lat, Integer buffer) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("request", "pois");

        Map<String, Object> geometry = new HashMap<>();
        Map<String, Object> geojson = new HashMap<>();
        geojson.put("type", "Point");
        geojson.put("coordinates", List.of(lon, lat));
        geometry.put("geojson", geojson);
        geometry.put("buffer", buffer != null ? buffer : 500);

        requestBody.put("geometry", geometry);

        return searchPois(requestBody);
    }

    /**
     * Simplified Route search between start and end coordinates.
     */
    public Object searchRouteSimple(double startLon, double startLat, double endLon, double endLat, String profile) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("coordinates", List.of(
                List.of(startLon, startLat),
                List.of(endLon, endLat)
        ));

        String resolvedProfile = profile != null ? profile : "driving-car";
        // Map simplified modes to ORS profiles
        if ("car".equalsIgnoreCase(resolvedProfile)) {
            resolvedProfile = "driving-car";
        } else if ("bike".equalsIgnoreCase(resolvedProfile)) {
            resolvedProfile = "cycling-regular";
        } else if ("walk".equalsIgnoreCase(resolvedProfile)) {
            resolvedProfile = "foot-walking";
        }

        return searchRoute(resolvedProfile, requestBody);
    }

    /**
     * Proxies the Overpass API query through the backend with a strict timeout and server rotation.
     */
    public Object fetchMapPlaces(double minLat, double minLon, double maxLat, double maxLon, int zoom) {
        String placeFilter = "city";
        if (zoom >= 4 && zoom < 6) {
            placeFilter = "node[\"place\"=\"country\"]";
        } else if (zoom >= 6 && zoom < 8) {
            placeFilter = "node[\"place\"=\"country\"]; node[\"place\"=\"city\"][\"capital\"=\"yes\"]";
        } else if (zoom >= 8 && zoom < 10) {
            placeFilter = "node[\"place\"=\"city\"]";
        } else if (zoom >= 10 && zoom < 12) {
            placeFilter = "node[\"place\"~\"^(city|town)$\"]";
        } else if (zoom >= 12 && zoom < 14) {
            placeFilter = "node[\"place\"~\"^(city|town|village)$\"]";
        } else if (zoom >= 14) {
            placeFilter = "node[\"place\"~\"^(city|town|village|suburb)$\"]";
        } else {
            return Map.of("elements", List.of());
        }

        String query = String.format("[out:json];(%s(%f,%f,%f,%f););out;", 
                placeFilter, minLat, minLon, maxLat, maxLon);

        // Put the allowed French mirror first, followed by others
        String[] mirrors = {
            "https://overpass.openstreetmap.fr/api/interpreter",
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter"
        };

        // Configure connection timeouts to prevent hanging on blocked/down mirrors
        org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory = 
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(2000); // 2 seconds connect timeout
        requestFactory.setReadTimeout(5000);    // 5 seconds read timeout

        RestClient client = RestClient.builder()
                .requestFactory(requestFactory)
                .build();

        for (String baseUrl : mirrors) {
            try {
                logger.info("Proxying Overpass query to mirror: {}", baseUrl);
                String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
                java.net.URI uri = java.net.URI.create(baseUrl + "?data=" + encodedQuery);
                return client.get()
                        .uri(uri)
                        .retrieve()
                        .body(Object.class);
            } catch (Exception e) {
                logger.warn("Failed to fetch from Overpass mirror {}: {}. Trying next...", baseUrl, e.getMessage());
            }
        }

        logger.error("All Overpass API mirrors failed to respond for query bounding box.");
        return Map.of("elements", List.of()); // Fail gracefully with empty list
    }
}
