package com.planner.wedding.services;

import com.planner.wedding.entities.*;
import com.planner.wedding.repositories.UserRepository;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.*;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService
        extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(
            OAuth2UserRequest request
    ) {

        OAuth2User oauthUser =
                super.loadUser(request);

        String email =
                oauthUser.getAttribute("email");

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(
                    "Google account did not provide email"
            );
        }

        String googleId =
                oauthUser.getAttribute("sub");

        userRepository.findByEmail(email)
                .orElseGet(() -> {

                    User user = User.builder()
                            .email(email)
                            .googleId(googleId)
                            .provider(AuthProvider.GOOGLE)
                            .role(UserRole.BRIDE)
                            .build();

                    return userRepository.save(user);
                });

        return oauthUser;
    }
}
