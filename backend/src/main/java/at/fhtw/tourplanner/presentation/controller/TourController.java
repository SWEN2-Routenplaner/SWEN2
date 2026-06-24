package at.fhtw.tourplanner.presentation.controller;

import at.fhtw.tourplanner.business.service.TourService;
import at.fhtw.tourplanner.presentation.dto.request.TourCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourResponse;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping
    public ResponseEntity<List<TourResponse>> listTours(
            @RequestParam(required = false) String name,
            @AuthenticationPrincipal Jwt jwt){
        String owner = jwt.getSubject();
        return ResponseEntity.ok(tourService.listTours(owner,name));
    }

    @PostMapping
    public ResponseEntity<TourResponse> createTour(
            @RequestBody TourCreateRequest request,
            @AuthenticationPrincipal Jwt jwt){
        String owner = jwt.getSubject();
        TourResponse created = tourService.createTour(owner,request);
        URI location = URI.create("/api/tours/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{tourId}")
    public ResponseEntity<TourResponse> getTour(
            @PathVariable Long tourId,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(tourService.getTour(jwt.getSubject(), tourId));
    }

    @PutMapping("/{tourId}")
    public ResponseEntity<TourResponse> updateTour(
            @PathVariable Long tourId,
            @Valid @RequestBody TourCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(tourService.updateTour(jwt.getSubject(), tourId, request));
    }

    @DeleteMapping("/{tourId}")
    public ResponseEntity<Void> deleteTour(
            @PathVariable Long tourId,
            @AuthenticationPrincipal Jwt jwt) {
        tourService.deleteTour(jwt.getSubject(), tourId);
        return ResponseEntity.noContent().build();
    }

    // TODO: Implement export
    @GetMapping
    public ResponseEntity<Resource> exportTours() {
        return ResponseEntity.noContent().build();
    }

    // TODO: Implement import
    public ResponseEntity<Resource> importTours() {
        return ResponseEntity.noContent().build();
    }

}
