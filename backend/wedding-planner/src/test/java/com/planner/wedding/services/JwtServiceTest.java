package com.planner.wedding.services;

import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        testUser = User.builder()
                .email("test@example.com")
                .role(UserRole.PLANNER)
                .build();
    }

    @Test
    void generateTokenCreatesValidNonEmptyToken() {
        String token = jwtService.generateToken(testUser);
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void extractEmailReturnsCorrectSubject() {
        String token = jwtService.generateToken(testUser);
        String email = jwtService.extractEmail(token);
        assertEquals("test@example.com", email);
    }

    @Test
    void isTokenValidReturnsTrueForValidToken() {
        String token = jwtService.generateToken(testUser);
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void isTokenValidReturnsFalseForMalformedToken() {
        assertFalse(jwtService.isTokenValid("malformed.token.string"));
        assertFalse(jwtService.isTokenValid(""));
        assertFalse(jwtService.isTokenValid(null));
    }
}
