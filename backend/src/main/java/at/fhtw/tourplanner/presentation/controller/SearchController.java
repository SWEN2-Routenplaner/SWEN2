package at.fhtw.tourplanner.presentation.controller;

import at.fhtw.tourplanner.business.service.SearchService;
import at.fhtw.tourplanner.presentation.dto.response.SearchResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/*
 * THIS REST API IS TESTABLE WITH SWAGGER UI UNDER http://localhost:8080/swagger-ui/index.html#/
 * */

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @ApiResponses({
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "400", description = "Missing query parameter")
    })
    public ResponseEntity<SearchResponse> search(
            @RequestParam String q,
            @AuthenticationPrincipal OidcUser principal) {
        return ResponseEntity.ok(searchService.search(principal.getSubject(), q));
    }
}
