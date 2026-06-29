package com.planner.wedding.services;

import com.planner.wedding.entities.Expense;
import com.planner.wedding.entities.Payment;
import com.planner.wedding.entities.PaymentStatus;
import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.User;
import com.planner.wedding.repositories.ExpenseRepository;
import com.planner.wedding.repositories.TaskRepository;
import com.planner.wedding.repositories.VendorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceOwnershipTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private EventService eventService;

    @Mock
    private ExpenseService expenseService;

    @Test
    void refusesToDeleteTaskWithPaymentHistory() {
        User user = User.builder().id(7L).build();
        Task task = Task.builder().id(3L).build();
        Payment payment = Payment.builder().status(PaymentStatus.CANCELLED).build();
        Expense expense = Expense.builder().task(task).payment(payment).build();
        when(taskRepository.findByIdAndEventId(3L, 2L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(3L)).thenReturn(List.of(expense));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service().deleteTask(2L, 3L, user)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(eventService).requireOwnedEvent(2L, user);
        verify(taskRepository, never()).delete(task);
    }

    @Test
    void refusesTaskFromDifferentEventId() {
        User user = User.builder().id(7L).build();

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service().getTask(2L, 3L, user)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(eventService).requireOwnedEvent(2L, user);
        verify(taskRepository).findByIdAndEventId(3L, 2L);
    }

    private TaskService service() {
        return new TaskService(taskRepository, expenseRepository, vendorRepository, eventPublisher, eventService, expenseService);
    }
}
