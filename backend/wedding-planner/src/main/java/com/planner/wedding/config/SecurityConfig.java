package com.planner.wedding.config;

import com.planner.wedding.services.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    public SecurityConfig(
            CustomOAuth2UserService customOAuth2UserService
    ) {
        this.customOAuth2UserService =
                customOAuth2UserService;
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/error",
                                "/login/**",
                                "/oauth2/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth -> oauth
                        .defaultSuccessUrl("/", true)
                        .userInfoEndpoint(userInfo ->
                                userInfo.userService(
                                        customOAuth2UserService
                                )
                        )
                );

        return http.build();
    }
}