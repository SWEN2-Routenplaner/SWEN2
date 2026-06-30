package at.fhtw.tourplanner.presentation.controller;

import at.fhtw.tourplanner.business.service.TourLogService;
import at.fhtw.tourplanner.presentation.dto.request.TourLogCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourLogResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/*
 * THIS REST API IS TESTABLE WITH SWAGGER UI UNDER http://localhost:8080/swagger-ui/index.html#/
 * */

@RestController
@RequiredArgsConstructor
public class TourLogController {

    private final TourLogService tourLogService;

    @GetMapping("/api/tours/{tourId}/logs")
    @ApiResponses({
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "404", description = "Tour not found")
    })
    public ResponseEntity<List<TourLogResponse>> listLogs(
            @PathVariable Long tourId,
            @AuthenticationPrincipal OidcUser principal) {
        return ResponseEntity.ok(tourLogService.listLogs(principal.getSubject(), tourId));
    }

    @PostMapping("/api/tours/{tourId}/logs")
    @ApiResponses({
            @ApiResponse(responseCode = "201"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Tour not found")
    })
    public ResponseEntity<TourLogResponse> createLog(
            @PathVariable Long tourId,
            @Valid @RequestBody TourLogCreateRequest request,
            @AuthenticationPrincipal OidcUser principal) {
        TourLogResponse created = tourLogService.createLog(principal.getSubject(), tourId, request);
        URI location = URI.create("/api/logs/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/api/logs/{logId}")
    @ApiResponses({
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "404", description = "Log not found")
    })
    public ResponseEntity<TourLogResponse> getLog(
            @PathVariable Long logId,
            @AuthenticationPrincipal OidcUser principal) {
        return ResponseEntity.ok(tourLogService.getLog(principal.getSubject(), logId));
    }

    @PutMapping("/api/logs/{logId}")
    @ApiResponses({
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Log not found")
    })
    public ResponseEntity<TourLogResponse> updateLog(
            @PathVariable Long logId,
            @Valid @RequestBody TourLogCreateRequest request,
            @AuthenticationPrincipal OidcUser principal) {
        return ResponseEntity.ok(tourLogService.updateLog(principal.getSubject(), logId, request));
    }

    @DeleteMapping("/api/logs/{logId}")
    @ApiResponses({
            @ApiResponse(responseCode = "204"),
            @ApiResponse(responseCode = "404", description = "Log not found")
    })
    public ResponseEntity<Void> deleteLog(
            @PathVariable Long logId,
            @AuthenticationPrincipal OidcUser principal) {
        tourLogService.deleteLog(principal.getSubject(), logId);
        return ResponseEntity.noContent().build();
    }

}