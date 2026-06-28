package at.fhtw.tourplanner.presentation.controller;

import at.fhtw.tourplanner.business.service.TourLogService;
import at.fhtw.tourplanner.presentation.dto.request.TourLogCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourLogResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
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
            @AuthenticationPrincipal OidcUser principal) {
        return ResponseEntity.ok(tourLogService.listLogs(principal.getSubject(), tourId));
    }

    @PostMapping
    public ResponseEntity<TourLogResponse> createLog(
            @PathVariable Long tourId,
            @Valid @RequestBody TourLogCreateRequest request,
            @AuthenticationPrincipal OidcUser principal) {
        TourLogResponse created = tourLogService.createLog(principal.getSubject(), tourId, request);
        URI location = URI.create("/api/tours/" + tourId + "/logs/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{logId}")
    public ResponseEntity<TourLogResponse> getLog(
            @PathVariable Long tourId,
            @PathVariable Long logId,
            @AuthenticationPrincipal OidcUser principal) {
        return ResponseEntity.ok(tourLogService.getLog(principal.getSubject(), tourId, logId));
    }

    @PutMapping("/{logId}")
    public ResponseEntity<TourLogResponse> updateLog(
            @PathVariable Long tourId,
            @PathVariable Long logId,
            @Valid @RequestBody TourLogCreateRequest request,
            @AuthenticationPrincipal OidcUser principal) {
        return ResponseEntity.ok(tourLogService.updateLog(principal.getSubject(), tourId, logId, request));
    }

    @DeleteMapping("/{logId}")
    public ResponseEntity<Void> deleteLog(
            @PathVariable Long tourId,
            @PathVariable Long logId,
            @AuthenticationPrincipal OidcUser principal) {
        tourLogService.deleteLog(principal.getSubject(), tourId, logId);
        return ResponseEntity.noContent().build();
    }

}
