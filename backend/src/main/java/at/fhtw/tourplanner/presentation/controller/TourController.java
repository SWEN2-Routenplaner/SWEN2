package at.fhtw.tourplanner.presentation.controller;

import at.fhtw.tourplanner.business.service.TourService;
import at.fhtw.tourplanner.presentation.dto.request.TourCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.ExportResult;
import at.fhtw.tourplanner.presentation.dto.response.ImportSummary;
import at.fhtw.tourplanner.presentation.dto.response.TourResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.nio.file.AccessDeniedException;
import java.util.List;

/*
 * THIS REST API IS TESTABLE WITH SWAGGER UI UNDER http://localhost:8080/swagger-ui/index.html#/
 * */

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class TourController {

    private final TourService tourService;

    @GetMapping
    @ApiResponses({
            @ApiResponse(responseCode = "200")
    })
    public ResponseEntity<List<TourResponse>> listTours(
            @RequestParam(required = false) String query,
            @AuthenticationPrincipal OidcUser principal){
        String owner = principal.getSubject();
        return ResponseEntity.ok(tourService.listTours(owner,query));
    }

    @PostMapping
    @ApiResponses({
            @ApiResponse(responseCode = "201"),
            @ApiResponse(responseCode = "400", description = "Invalid request body")
    })
    public ResponseEntity<TourResponse> createTour(
            @RequestBody TourCreateRequest request,
            @AuthenticationPrincipal OidcUser principal){
        String owner = principal.getSubject();
        TourResponse created = tourService.createTour(owner,request);
        URI location = URI.create("/api/tours/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{tourId}")
    @ApiResponses({
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "403", description = "Not your resource"),
            @ApiResponse(responseCode = "404", description = "Tour not found")
    })
    public ResponseEntity<TourResponse> getTour(
            @PathVariable Long tourId,
            @AuthenticationPrincipal OidcUser principal) throws AccessDeniedException {
        return ResponseEntity.ok(tourService.getTour(principal.getSubject(), tourId));
    }

    @PutMapping("/{tourId}")
    @ApiResponses({
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "403", description = "Not your resource"),
            @ApiResponse(responseCode = "404", description = "Tour not found")
    })
    public ResponseEntity<TourResponse> updateTour(
            @PathVariable Long tourId,
            @Valid @RequestBody TourCreateRequest request,
            @AuthenticationPrincipal OidcUser principal) throws AccessDeniedException {
        return ResponseEntity.ok(tourService.updateTour(principal.getSubject(), tourId, request));
    }

    @DeleteMapping("/{tourId}")
    @ApiResponses({
            @ApiResponse(responseCode = "204"),
            @ApiResponse(responseCode = "403", description = "Not your resource"),
            @ApiResponse(responseCode = "404", description = "Tour not found")
    })
    public ResponseEntity<Void> deleteTour(
            @PathVariable Long tourId,
            @AuthenticationPrincipal OidcUser principal) throws AccessDeniedException {
        tourService.deleteTour(principal.getSubject(), tourId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{tourId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiResponses({
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "400", description = "Invalid or missing file"),
            @ApiResponse(responseCode = "403", description = "Not your resource"),
            @ApiResponse(responseCode = "404", description = "Tour not found")
    })
    public ResponseEntity<TourResponse> uploadImage(
            @PathVariable Long tourId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal OidcUser principal) throws AccessDeniedException {
        return ResponseEntity.ok(tourService.uploadImage(principal.getSubject(), tourId, file));
    }

    @GetMapping("/{tourId}/image")
    @ApiResponses({
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "403", description = "Not your resource"),
            @ApiResponse(responseCode = "404", description = "Tour or image not found")
    })
    public ResponseEntity<Resource> getImage(
            @PathVariable Long tourId,
            @AuthenticationPrincipal OidcUser principal) throws AccessDeniedException {
        TourService.ImageResource image = tourService.getImage(principal.getSubject(), tourId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.contentType()))
                .body(image.resource());
    }

    // TODO: Implement export
    @GetMapping("/{tourId}/export")
    @ApiResponses({
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "400", description = "Unsupported format"),
            @ApiResponse(responseCode = "403", description = "Not your resource"),
            @ApiResponse(responseCode = "404", description = "Tour not found")
    })
    public ResponseEntity<String> exportTours(
            @PathVariable Long tourId,
            @RequestParam(defaultValue = "json") String format,
            @AuthenticationPrincipal OidcUser principal) throws AccessDeniedException {
        
        String exportedData = tourService.exportTours(principal.getSubject(), tourId, format);
        String filename = "tour_" + tourId + "." + format;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setContentDispositionFormData("attachment", filename);

        return ResponseEntity.ok()
        .headers(headers)
        .body(exportedData);
    }

    // TODO: Implement import
    @PostMapping(value="/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiResponses({
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "400", description = "Invalid or missing file")
    })
    public ResponseEntity<ImportSummary> importTours(
            @RequestParam("file")MultipartFile file,
            @AuthenticationPrincipal OidcUser principal) {
        return ResponseEntity.ok(tourService.importTours(principal.getSubject(), file));
    }
}
