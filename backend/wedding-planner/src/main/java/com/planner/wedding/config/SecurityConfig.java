package com.planner.wedding.config;

import com.planner.wedding.services.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuthSuccessHandler oAuthSuccessHandler;
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(
            CustomOAuth2UserService customOAuth2UserService,
            OAuthSuccessHandler oAuthSuccessHandler,
            JwtAuthFilter jwtAuthFilter
    ) {
        this.customOAuth2UserService =
                customOAuth2UserService;

        this.oAuthSuccessHandler =
                oAuthSuccessHandler;

        this.jwtAuthFilter =
                jwtAuthFilter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/error",
                                "/login/**",
                                "/oauth2/**",
                                "/api/auth/**",
                                "/api/public/rsvp/**",
                                "/api/payments/**",
                                "/api/expenses/**",
                                "/api/vendors/**"
                        ).permitAll()
                        // TODO: To jest tylko do lokalnego testowania. Docelowo endpointy payments/expenses/vendors powinny być zabezpieczone.
                        // TODO: Docelowo /api/payments/{id}/offline-approve powinien wymagać roli ADMIN.
                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth -> oauth
                        .successHandler(oAuthSuccessHandler)
                        .userInfoEndpoint(userInfo ->
                                userInfo.userService(
                                        customOAuth2UserService
                                )
                        )
                )

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
}
