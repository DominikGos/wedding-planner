package com.planner.wedding.integration;

import com.planner.wedding.dto.FindRsvpRequest;
import com.planner.wedding.dto.PublicRsvpResponse;
import com.planner.wedding.dto.UpdateRsvpRequest;
import com.planner.wedding.services.PublicRsvpService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class PublicRsvpControllerIntegrationTest extends BaseIntegrationTest {

    @MockitoBean
    private PublicRsvpService publicRsvpService;

    @Test
    void findInvitationReturnsRsvp() {
        var request = new FindRsvpRequest("EVENT123", "John", "Doe");
        var responseDto = new PublicRsvpResponse(
                "Wedding", null, "Venue", "John Doe", "PENDING", null, null, "EVENT123", "GUEST123"
        );
        when(publicRsvpService.findInvitation(eq("EVENT123"), eq("John"), eq("Doe"))).thenReturn(responseDto);

        webTestClient.post()
                .uri("/api/public/rsvp/find")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.guestCode").isEqualTo("GUEST123")
                .jsonPath("$.rsvpStatus").isEqualTo("PENDING");
    }

    @Test
    void getInvitationReturnsRsvp() {
        var responseDto = new PublicRsvpResponse(
                "Wedding", null, "Venue", "John Doe", "ACCEPTED", null, null, "EVENT123", "GUEST123"
        );
        when(publicRsvpService.getInvitation(eq("EVENT123"), eq("GUEST123"))).thenReturn(responseDto);

        webTestClient.get()
                .uri("/api/public/rsvp/EVENT123/GUEST123")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.rsvpStatus").isEqualTo("ACCEPTED");
    }

    @Test
    void updateStatusReturnsRsvp() {
        var request = new UpdateRsvpRequest("DECLINED", null, "Busy");
        var responseDto = new PublicRsvpResponse(
                "Wedding", null, "Venue", "John Doe", "DECLINED", null, "Busy", "EVENT123", "GUEST123"
        );
        when(publicRsvpService.updateStatus(eq("EVENT123"), eq("GUEST123"), eq("DECLINED"), any(), eq("Busy")))
                .thenReturn(responseDto);

        webTestClient.patch()
                .uri("/api/public/rsvp/EVENT123/GUEST123")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.rsvpStatus").isEqualTo("DECLINED")
                .jsonPath("$.declineReason").isEqualTo("Busy");
    }
}
