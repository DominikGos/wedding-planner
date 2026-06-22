package com.planner.wedding.services;

import com.planner.wedding.dto.AuthRequest;
import com.planner.wedding.dto.AuthResponse;
import com.planner.wedding.dto.RegisterRequest;
import com.planner.wedding.entities.AuthProvider;
import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import com.planner.wedding.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerNewUserSuccess() {
        RegisterRequest request = new RegisterRequest("test@example.com", "password", "Name", "couple");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("hashed-pwd");
        
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });
        
        when(jwtService.generateToken(any(User.class))).thenReturn("token-123");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("token-123", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("BRIDE", response.getRole());
        assertEquals("Name", response.getName());

        verify(userRepository).save(argThat(user -> 
            user.getEmail().equals("test@example.com") &&
            user.getPassword().equals("hashed-pwd") &&
            user.getRole() == UserRole.BRIDE &&
            user.getProvider() == AuthProvider.LOCAL
        ));
    }

    @Test
    void registerNewUserThrowsWhenEmailExists() {
        RegisterRequest request = new RegisterRequest("test@example.com", "password", "Name", "couple");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(new User()));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Email already exists", ex.getReason());
    }

    @Test
    void loginSuccess() {
        AuthRequest request = new AuthRequest("test@example.com", "password");
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("hashed-pwd")
                .role(UserRole.BRIDE)
                .provider(AuthProvider.LOCAL)
                .name("Name")
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashed-pwd")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("token-123");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("token-123", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("BRIDE", response.getRole());
    }

    @Test
    void loginThrowsWhenPasswordIncorrect() {
        AuthRequest request = new AuthRequest("test@example.com", "wrong-pwd");
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("hashed-pwd")
                .provider(AuthProvider.LOCAL)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-pwd", "hashed-pwd")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.login(request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Invalid email or password", ex.getReason());
    }
}
