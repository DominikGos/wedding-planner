package com.planner.wedding.integration;

import com.planner.wedding.entities.Guest;
import com.planner.wedding.services.GuestService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GuestControllerIntegrationTest extends BaseIntegrationTest {

    @MockitoBean
    private GuestService guestService;

    @Test
    void getGuestsReturnsList() {
        var guest = Guest.builder().id(1L).firstName("John").lastName("Doe").build();
        when(guestService.findByEventId(eq(10L), any())).thenReturn(List.of(guest));

        webTestClient.get()
                .uri("/api/events/10/guests")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].id").isEqualTo(1)
                .jsonPath("$[0].firstName").isEqualTo("John");
    }

    @Test
    void getGuestByIdReturnsGuest() {
        var guest = Guest.builder().id(1L).firstName("John").lastName("Doe").build();
        when(guestService.findById(eq(10L), eq(1L), any())).thenReturn(guest);

        webTestClient.get()
                .uri("/api/events/10/guests/1")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.firstName").isEqualTo("John");
    }

    @Test
    void createGuestReturns201() {
        var input = Guest.builder().firstName("Jane").lastName("Doe").email("jane@example.com").build();
        var output = Guest.builder().id(1L).firstName("Jane").lastName("Doe").build();
        when(guestService.create(eq(10L), any(Guest.class), any())).thenReturn(output);

        webTestClient.post()
                .uri("/api/events/10/guests")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(input)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.firstName").isEqualTo("Jane");
    }

    @Test
    void updateGuestReturnsUpdated() {
        var input = Guest.builder().firstName("John").lastName("Smith").build();
        var output = Guest.builder().id(1L).firstName("John").lastName("Smith").build();
        when(guestService.update(eq(10L), eq(1L), any(Guest.class), any())).thenReturn(output);

        webTestClient.put()
                .uri("/api/events/10/guests/1")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(input)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.lastName").isEqualTo("Smith");
    }

    @Test
    void deleteGuestReturns204() {
        webTestClient.delete()
                .uri("/api/events/10/guests/1")
                .exchange()
                .expectStatus().isNoContent();

        verify(guestService).delete(eq(10L), eq(1L), any());
    }
}
