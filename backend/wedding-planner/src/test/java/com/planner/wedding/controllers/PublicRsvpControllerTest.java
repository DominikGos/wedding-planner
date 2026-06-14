package com.planner.wedding.controllers;

import tools.jackson.databind.ObjectMapper;
import com.planner.wedding.dto.FindRsvpRequest;
import com.planner.wedding.dto.PublicRsvpResponse;
import com.planner.wedding.dto.UpdateRsvpRequest;
import com.planner.wedding.services.PublicRsvpService;
import com.planner.wedding.services.JwtService;
import com.planner.wedding.repositories.UserRepository;
import com.planner.wedding.services.CustomOAuth2UserService;
import com.planner.wedding.config.OAuthSuccessHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PublicRsvpController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        OAuth2ClientAutoConfiguration.class,
        OAuth2ClientWebSecurityAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
class PublicRsvpControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PublicRsvpService publicRsvpService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private CustomOAuth2UserService customOAuth2UserService;

    @MockitoBean
    private OAuthSuccessHandler oAuthSuccessHandler;

    @Test
    void findInvitationReturnsResponse() throws Exception {
        FindRsvpRequest request = new FindRsvpRequest("EV123", "John", "Doe");
        PublicRsvpResponse response = new PublicRsvpResponse(
                "Wedding",
                LocalDateTime.of(2026, 6, 20, 16, 0),
                "Church",
                "John Doe",
                "PENDING",
                "none",
                null,
                "EV123",
                "GST99"
        );

        when(publicRsvpService.findInvitation("EV123", "John", "Doe")).thenReturn(response);

        mockMvc.perform(post("/api/public/rsvp/find")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventName").value("Wedding"))
                .andExpect(jsonPath("$.guestName").value("John Doe"))
                .andExpect(jsonPath("$.rsvpStatus").value("PENDING"))
                .andExpect(jsonPath("$.eventCode").value("EV123"))
                .andExpect(jsonPath("$.guestCode").value("GST99"));
    }

    @Test
    void getInvitationReturnsResponse() throws Exception {
        PublicRsvpResponse response = new PublicRsvpResponse(
                "Wedding",
                LocalDateTime.of(2026, 6, 20, 16, 0),
                "Church",
                "John Doe",
                "PENDING",
                "none",
                null,
                "EV123",
                "GST99"
        );

        when(publicRsvpService.getInvitation("EV123", "GST99")).thenReturn(response);

        mockMvc.perform(get("/api/public/rsvp/EV123/GST99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventName").value("Wedding"))
                .andExpect(jsonPath("$.guestName").value("John Doe"));
    }

    @Test
    void updateStatusReturnsResponse() throws Exception {
        UpdateRsvpRequest request = new UpdateRsvpRequest("CONFIRMED", "peanuts", null);
        PublicRsvpResponse response = new PublicRsvpResponse(
                "Wedding",
                LocalDateTime.of(2026, 6, 20, 16, 0),
                "Church",
                "John Doe",
                "CONFIRMED",
                "peanuts",
                null,
                "EV123",
                "GST99"
        );

        when(publicRsvpService.updateStatus("EV123", "GST99", "CONFIRMED", "peanuts", null)).thenReturn(response);

        mockMvc.perform(patch("/api/public/rsvp/EV123/GST99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rsvpStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$.allergies").value("peanuts"));
    }
}
