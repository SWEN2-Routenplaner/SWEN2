package at.fhtw.tourplanner.presentation.controller;

import at.fhtw.tourplanner.business.service.TourLogService;
import at.fhtw.tourplanner.presentation.dto.request.TourLogCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourLogResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tours/{tourId}/logs")
@RequiredArgsConstructor
public class TourLogController {

    private final TourLogService tourLogService;

    @GetMapping
    public ResponseEntity<List<TourLogResponse>> listLogs(
            @PathVariable Long tourId,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(tourLogService.listLogs(jwt.getSubject(), tourId));
    }

    @PostMapping
    public ResponseEntity<TourLogResponse> createLog(
            @PathVariable Long tourId,
            @Valid @RequestBody TourLogCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        TourLogResponse created = tourLogService.createLog(jwt.getSubject(), tourId, request);
        URI location = URI.create("/api/tours/" + tourId + "/logs/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{logId}")
    public ResponseEntity<TourLogResponse> getLog(
            @PathVariable Long tourId,
            @PathVariable Long logId,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(tourLogService.getLog(jwt.getSubject(), tourId, logId));
    }

    @PutMapping("/{logId}")
    public ResponseEntity<TourLogResponse> updateLog(
            @PathVariable Long tourId,
            @PathVariable Long logId,
            @Valid @RequestBody TourLogCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(tourLogService.updateLog(jwt.getSubject(), tourId, logId, request));
    }

    @DeleteMapping("/{logId}")
    public ResponseEntity<Void> deleteLog(
            @PathVariable Long tourId,
            @PathVariable Long logId,
            @AuthenticationPrincipal Jwt jwt) {
        tourLogService.deleteLog(jwt.getSubject(), tourId, logId);
        return ResponseEntity.noContent().build();
    }

}
