package at.fhtw.tourplanner;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login/start")
    public String startLogin() {
        // This triggers the Spring Security OAuth2/OIDC flow for the client 'authentik'
        return "redirect:/oauth2/authorization/authentik";
    }
}
