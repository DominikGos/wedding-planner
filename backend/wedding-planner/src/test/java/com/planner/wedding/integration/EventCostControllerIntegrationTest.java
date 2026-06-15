package com.planner.wedding.integration;

import com.planner.wedding.dto.EventCostSummaryDTO;
import com.planner.wedding.services.TaskCostService;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class EventCostControllerIntegrationTest extends BaseIntegrationTest {

    @MockitoBean
    private TaskCostService taskCostService;

    @Test
    void getEventCostSummaryReturnsSummary() {
        var summary = EventCostSummaryDTO.builder()
                .eventId(10L)
                .tasks(List.of())
                .totalCost(new BigDecimal("1500.00"))
                .build();
        when(taskCostService.calculateEventCostSummary(eq(10L), any())).thenReturn(summary);

        webTestClient.get()
                .uri("/api/events/10/cost-summary")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.eventId").isEqualTo(10)
                .jsonPath("$.totalCost").isEqualTo(1500.00);
    }
}
