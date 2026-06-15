package com.planner.wedding.integration;

import com.planner.wedding.dto.CreateExpenseRequest;
import com.planner.wedding.dto.ExpenseResponse;
import com.planner.wedding.services.ExpenseService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ExpenseControllerIntegrationTest extends BaseIntegrationTest {

    @MockitoBean
    private ExpenseService expenseService;

    @Test
    void getExpensesReturnsList() {
        var expense = ExpenseResponse.builder().id(1L).description("Catering").build();
        when(expenseService.getExpenses(any(), any(), any())).thenReturn(List.of(expense));

        webTestClient.get()
                .uri("/api/expenses")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].id").isEqualTo(1)
                .jsonPath("$[0].description").isEqualTo("Catering");
    }

    @Test
    void getExpenseByIdReturnsExpense() {
        var expense = ExpenseResponse.builder().id(1L).description("Catering").build();
        when(expenseService.getExpenseById(eq(1L), any())).thenReturn(expense);

        webTestClient.get()
                .uri("/api/expenses/1")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.description").isEqualTo("Catering");
    }

    @Test
    void createExpenseReturns201() {
        var request = CreateExpenseRequest.builder().description("Catering").build();
        var responseDto = ExpenseResponse.builder().id(1L).description("Catering").build();
        when(expenseService.createExpense(any(CreateExpenseRequest.class), any())).thenReturn(responseDto);

        webTestClient.post()
                .uri("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.description").isEqualTo("Catering");
    }

    @Test
    void updateExpenseReturnsUpdated() {
        var request = CreateExpenseRequest.builder().description("Updated").build();
        var responseDto = ExpenseResponse.builder().id(1L).description("Updated").build();
        when(expenseService.updateExpense(eq(1L), any(CreateExpenseRequest.class), any())).thenReturn(responseDto);

        webTestClient.put()
                .uri("/api/expenses/1")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.description").isEqualTo("Updated");
    }

    @Test
    void deleteExpenseReturns204() {
        webTestClient.delete()
                .uri("/api/expenses/1")
                .exchange()
                .expectStatus().isNoContent();

        verify(expenseService).deleteExpense(eq(1L), any());
    }
}
