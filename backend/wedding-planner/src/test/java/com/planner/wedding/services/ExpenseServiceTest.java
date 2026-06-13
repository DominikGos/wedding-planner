package com.planner.wedding.services;

import com.planner.wedding.dto.CreateExpenseRequest;
import com.planner.wedding.dto.ExpenseResponse;
import com.planner.wedding.entities.*;
import com.planner.wedding.repositories.ExpenseRepository;
import com.planner.wedding.repositories.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private EventService eventService;

    @InjectMocks
    private ExpenseService expenseService;

    @Test
    void getExpensesByTaskIdForAuthenticatedUser() {
        User user = User.builder().id(1L).build();
        Event event = Event.builder().id(10L).build();
        Task task = Task.builder().id(100L).event(event).build();
        Expense expense = Expense.builder().id(200L).task(task).amount(BigDecimal.TEN).build();

        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of(expense));

        List<ExpenseResponse> result = expenseService.getExpenses(100L, null, user);

        assertEquals(1, result.size());
        assertEquals(200L, result.get(0).getId());
        assertEquals(BigDecimal.TEN, result.get(0).getAmount());
        verify(eventService).requireOwnedEvent(10L, user);
    }

    @Test
    void getExpensesByEventIdForAuthenticatedUser() {
        User user = User.builder().id(1L).build();
        Event event = Event.builder().id(10L).build();
        Task task = Task.builder().id(100L).event(event).build();
        Expense expense = Expense.builder().id(200L).task(task).amount(BigDecimal.TEN).build();

        when(taskRepository.findByEventId(10L)).thenReturn(List.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of(expense));

        List<ExpenseResponse> result = expenseService.getExpenses(null, 10L, user);

        assertEquals(1, result.size());
        assertEquals(200L, result.get(0).getId());
        verify(eventService).requireOwnedEvent(10L, user);
    }

    @Test
    void createExpenseValidatesOwnershipAndSaves() {
        User user = User.builder().id(1L).build();
        Event event = Event.builder().id(10L).build();
        Task task = Task.builder().id(100L).event(event).build();
        CreateExpenseRequest request = CreateExpenseRequest.builder()
                .taskId(100L)
                .amount(BigDecimal.valueOf(150))
                .description("Table decorations")
                .build();

        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(inv -> {
            Expense e = inv.getArgument(0);
            e.setId(250L);
            return e;
        });

        ExpenseResponse response = expenseService.createExpense(request, user);

        assertEquals(250L, response.getId());
        assertEquals(100L, response.getTaskId());
        assertEquals(BigDecimal.valueOf(150), response.getAmount());
        assertEquals("Table decorations", response.getDescription());
        verify(eventService).requireOwnedEvent(10L, user);
        verify(expenseRepository).save(any(Expense.class));
    }

    @Test
    void deleteExpenseValidatesOwnershipAndDeletes() {
        User user = User.builder().id(1L).build();
        Event event = Event.builder().id(10L).build();
        Task task = Task.builder().id(100L).event(event).build();
        Expense expense = Expense.builder().id(200L).task(task).build();

        when(expenseRepository.findById(200L)).thenReturn(Optional.of(expense));

        expenseService.deleteExpense(200L, user);

        verify(eventService).requireOwnedEvent(10L, user);
        verify(expenseRepository).delete(expense);
    }
}
