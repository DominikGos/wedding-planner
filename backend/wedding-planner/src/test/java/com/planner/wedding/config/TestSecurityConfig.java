package com.planner.wedding.config;

import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.List;

@TestConfiguration
public class TestSecurityConfig {

    @Bean
    SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/**")
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .addFilterAfter(new OncePerRequestFilter() {
                    @Override
                    protected void doFilterInternal(
                            jakarta.servlet.http.HttpServletRequest request,
                            jakarta.servlet.http.HttpServletResponse response,
                            jakarta.servlet.FilterChain chain
                    ) throws jakarta.servlet.ServletException, java.io.IOException {
                        User testUser = User.builder()
                                .id(7L)
                                .email("test@example.com")
                                .role(UserRole.PLANNER)
                                .build();
                        Authentication auth = new UsernamePasswordAuthenticationToken(
                                testUser, null, List.of(new SimpleGrantedAuthority("ROLE_" + testUser.getRole()))
                        );
                        SecurityContext context = SecurityContextHolder.createEmptyContext();
                        context.setAuthentication(auth);
                        SecurityContextHolder.setContext(context);
                        chain.doFilter(request, response);
                    }
                }, SecurityContextHolderFilter.class);
        return http.build();
    }
}
