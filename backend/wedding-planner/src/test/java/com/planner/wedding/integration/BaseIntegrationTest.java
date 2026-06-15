package com.planner.wedding.integration;

import com.planner.wedding.config.OAuthSuccessHandler;
import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import com.planner.wedding.repositories.UserRepository;
import com.planner.wedding.services.CustomOAuth2UserService;
import com.planner.wedding.services.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(com.planner.wedding.config.TestSecurityConfig.class)
public abstract class BaseIntegrationTest {

    protected WebTestClient webTestClient;

    @LocalServerPort
    protected int port;

    @MockitoBean
    protected JwtService jwtService;

    @MockitoBean
    protected UserRepository userRepository;

    @MockitoBean
    protected CustomOAuth2UserService customOAuth2UserService;

    @MockitoBean
    protected OAuthSuccessHandler oAuthSuccessHandler;

    protected User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(7L)
                .email("test@example.com")
                .role(UserRole.PLANNER)
                .build();
        webTestClient = WebTestClient.bindToServer()
                .baseUrl("http://localhost:" + port)
                .build();
    }
}
