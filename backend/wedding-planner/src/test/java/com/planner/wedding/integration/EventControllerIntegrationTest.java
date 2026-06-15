package com.planner.wedding.integration;

import com.planner.wedding.entities.Event;
import com.planner.wedding.services.EventService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EventControllerIntegrationTest extends BaseIntegrationTest {

    @MockitoBean
    private EventService eventService;

    @Test
    void getAllEventsReturnsList() {
        var event = Event.builder().id(1L).name("Wedding").build();
        when(eventService.findAll(any())).thenReturn(List.of(event));

        webTestClient.get()
                .uri("/api/events")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].id").isEqualTo(1)
                .jsonPath("$[0].name").isEqualTo("Wedding");
    }

    @Test
    void getEventReturnsEvent() {
        var event = Event.builder().id(1L).name("Wedding").build();
        when(eventService.findById(eq(1L), any())).thenReturn(event);

        webTestClient.get()
                .uri("/api/events/1")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.name").isEqualTo("Wedding");
    }

    @Test
    void createEventReturnsOk() {
        var input = Event.builder().name("New Event").eventDate(LocalDateTime.now()).location("Venue").build();
        var output = Event.builder().id(10L).name("New Event").build();
        when(eventService.create(any(Event.class), any())).thenReturn(output);

        webTestClient.post()
                .uri("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(input)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(10)
                .jsonPath("$.name").isEqualTo("New Event");
    }

    @Test
    void updateEventReturnsUpdated() {
        var input = Event.builder().name("Updated Wedding").build();
        var output = Event.builder().id(1L).name("Updated Wedding").build();
        when(eventService.update(eq(1L), any(Event.class), any())).thenReturn(output);

        webTestClient.put()
                .uri("/api/events/1")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(input)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.name").isEqualTo("Updated Wedding");
    }

    @Test
    void deleteEventReturnsOk() {
        webTestClient.delete()
                .uri("/api/events/1")
                .exchange()
                .expectStatus().isOk();

        verify(eventService).delete(eq(1L), any());
    }
}
