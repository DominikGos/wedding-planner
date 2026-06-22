package com.planner.wedding.config;

import com.planner.wedding.entities.AuthProvider;
import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import com.planner.wedding.repositories.UserRepository;
import com.planner.wedding.services.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuthSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final String oauthSuccessUrl;

    public OAuthSuccessHandler(
            JwtService jwtService,
            UserRepository userRepository,
            @Value("${app.frontend.oauth-success-url}")
            String oauthSuccessUrl
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.oauthSuccessUrl = oauthSuccessUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();

        String email =
                oauthUser.getAttribute("email");

        if (email == null || email.isBlank()) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Google account did not provide email"
            );
            return;
        }

        String googleId =
                oauthUser.getAttribute("sub");

        User user =
                userRepository.findByEmail(email)
                        .orElseGet(() -> {

                            User newUser = User.builder()
                                    .email(email)
                                    .googleId(googleId)
                                    .provider(AuthProvider.GOOGLE)
                                    .role(UserRole.BRIDE)
                                    .build();

                            return userRepository.save(newUser);
                        });

        String token =
                jwtService.generateToken(user);

        String redirectUrl =
                UriComponentsBuilder
                        .fromUriString(oauthSuccessUrl)
                        .queryParam("token", token)
                        .build()
                        .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
