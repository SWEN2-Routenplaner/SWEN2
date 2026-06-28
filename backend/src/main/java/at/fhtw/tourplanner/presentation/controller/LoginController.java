package at.fhtw.tourplanner.presentation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login/start")
    public String startLogin() {
        // This triggers the Spring Security OAuth2/OIDC flow for the client 'authentik'
        return "redirect:/oauth2/authorization/authentik";
    }

    // for debug - real thing not implemented yet
    @GetMapping("/user")
    public ResponseEntity<OAuth2User> getUser(@AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(principal);
    }
}
