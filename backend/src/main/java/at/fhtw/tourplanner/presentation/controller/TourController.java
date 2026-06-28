package at.fhtw.tourplanner.presentation.controller;

import at.fhtw.tourplanner.business.service.TourService;
import at.fhtw.tourplanner.presentation.dto.request.TourCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.ExportResult;
import at.fhtw.tourplanner.presentation.dto.response.ImportSummary;
import at.fhtw.tourplanner.presentation.dto.response.TourResponse;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping
    public ResponseEntity<List<TourResponse>> listTours(
            @RequestParam(required = false) String query,
            @AuthenticationPrincipal OidcUser principal){
        String owner = principal.getSubject();
        return ResponseEntity.ok(tourService.listTours(owner,query));
    }

    @PostMapping
    public ResponseEntity<TourResponse> createTour(
            @RequestBody TourCreateRequest request,
            @AuthenticationPrincipal OidcUser principal){
        String owner = principal.getSubject();
        TourResponse created = tourService.createTour(owner,request);
        URI location = URI.create("/api/tours/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{tourId}")
    public ResponseEntity<TourResponse> getTour(
            @PathVariable Long tourId,
            @AuthenticationPrincipal OidcUser principal) throws AccessDeniedException {
        return ResponseEntity.ok(tourService.getTour(principal.getSubject(), tourId));
    }

    @PutMapping("/{tourId}")
    public ResponseEntity<TourResponse> updateTour(
            @PathVariable Long tourId,
            @Valid @RequestBody TourCreateRequest request,
            @AuthenticationPrincipal OidcUser principal) throws AccessDeniedException {
        return ResponseEntity.ok(tourService.updateTour(principal.getSubject(), tourId, request));
    }

    @DeleteMapping("/{tourId}")
    public ResponseEntity<Void> deleteTour(
            @PathVariable Long tourId,
            @AuthenticationPrincipal OidcUser principal) throws AccessDeniedException {
        tourService.deleteTour(principal.getSubject(), tourId);
        return ResponseEntity.noContent().build();
    }

    // TODO: Implement export
    @GetMapping("/export")
    public ResponseEntity<Resource> exportTours(
            @RequestParam(defaultValue = "json") String format,
            @AuthenticationPrincipal OidcUser principal) {
        ExportResult result = tourService.exportTours(principal.getSubject(), format);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tours." + format + "\"")
                .contentType(result.mediaType())
                .body((Resource) result.resource());
    }

    // TODO: Implement import
    @PostMapping(value="/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportSummary> importTours(
            @RequestParam("file")MultipartFile file,
            @AuthenticationPrincipal OidcUser principal) {
        return ResponseEntity.ok(tourService.importTours(principal.getSubject(), file));
    }

}
