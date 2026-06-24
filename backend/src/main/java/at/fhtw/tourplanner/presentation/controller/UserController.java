package at.fhtw.tourplanner.presentation.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/me")
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return Map.of("authenticated", false);
        }
        return Map.of(
            "authenticated", true,
            "username", principal.getPreferredUsername(),
            "email", principal.getEmail(),
            "fullName", principal.getFullName(),
            "sub", principal.getSubject()
        );
    }
}
