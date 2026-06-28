package com.planner.wedding.services;

import com.planner.wedding.dto.CreateTaskDTO;
import com.planner.wedding.entities.*;
import com.planner.wedding.events.TaskStatusChangedEvent;
import com.planner.wedding.repositories.ExpenseRepository;
import com.planner.wedding.repositories.TaskRepository;
import com.planner.wedding.repositories.VendorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

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

    @InjectMocks
    private TaskService taskService;

    @Test
    void createTaskCateringSuccess() {
        User user = User.builder().id(1L).role(UserRole.PLANNER).build();
        Event event = Event.builder().id(10L).build();
        CreateTaskDTO dto = CreateTaskDTO.builder()
                .name("Catering Task")
                .type(TaskType.CATERING)
                .pricePerGuest(BigDecimal.valueOf(100))
                .numberOfGuests(50)
                .mealType("BUFFET")
                .vendorId(5L)
                .build();

        Vendor vendor = Vendor.builder().id(5L).companyName("Best Food").build();

        when(eventService.requireOwnedEvent(10L, user)).thenReturn(event);
        when(vendorRepository.findById(5L)).thenReturn(Optional.of(vendor));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(100L);
            return t;
        });

        Map<String, Object> result = taskService.createTask(10L, dto, user);

        assertNotNull(result);
        assertEquals(100L, result.get("id"));
        assertEquals("Catering Task", result.get("name"));
        assertEquals(TaskType.CATERING, result.get("type"));
        assertEquals(PaymentMethod.ONLINE, result.get("paymentMethod"));
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void createTaskVendorNotFoundThrows() {
        User user = User.builder().id(1L).build();
        Event event = Event.builder().id(10L).build();
        CreateTaskDTO dto = CreateTaskDTO.builder()
                .name("Catering Task")
                .type(TaskType.CATERING)
                .vendorId(5L)
                .build();

        when(eventService.requireOwnedEvent(10L, user)).thenReturn(event);
        when(vendorRepository.findById(5L)).thenReturn(Optional.empty());

        Exception ex = assertThrows(RuntimeException.class, () -> taskService.createTask(10L, dto, user));
        assertEquals("Vendor not found", ex.getMessage());
    }

    @Test
    void getTasksByEventReturnsList() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder()
                .id(100L)
                .name("Catering Task")
                .type(TaskType.CATERING)
                .pricePerGuest(BigDecimal.valueOf(100))
                .numberOfGuests(50)
                .mealType("BUFFET")
                .build();

        when(taskRepository.findByEventId(10L)).thenReturn(List.of(task));

        List<Map<String, Object>> result = taskService.getTasksByEvent(10L, user);

        assertEquals(1, result.size());
        assertEquals("Catering Task", result.get(0).get("name"));
        verify(eventService).requireOwnedEvent(10L, user);
    }

    @Test
    void getTaskScheduleReturnsSortedList() {
        User user = User.builder().id(1L).build();
        Task t1 = Task.builder().id(1L).type(TaskType.CATERING).dueDate(LocalDateTime.now().plusDays(2)).build();
        Task t2 = Task.builder().id(2L).type(TaskType.DECORATION).dueDate(LocalDateTime.now().plusDays(1)).build();

        when(taskRepository.findByEventId(10L)).thenReturn(List.of(t1, t2));

        List<Map<String, Object>> result = taskService.getTaskSchedule(10L, user);

        assertEquals(2, result.size());
        assertEquals(2L, result.get(0).get("id"));
        assertEquals(1L, result.get(1).get("id"));
    }

    @Test
    void getTaskReturnsTaskMap() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder().id(100L).type(TaskType.ENTERTAINMENT).build();
        Payment payment = Payment.builder().status(PaymentStatus.PENDING).build();
        Expense expense = Expense.builder().task(task).payment(payment).build();
        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of(expense));

        Map<String, Object> result = taskService.getTask(10L, 100L, user);

        assertEquals(100L, result.get("id"));
        assertEquals(true, result.get("lockedByPayment"));
        verify(eventService).requireOwnedEvent(10L, user);
    }

    @Test
    void updateTaskCateringSuccess() {
        User user = User.builder().id(1L).role(UserRole.BRIDE).build();
        Task task = Task.builder().id(100L).type(TaskType.CATERING).build();
        CreateTaskDTO dto = CreateTaskDTO.builder()
                .name("New Name")
                .type(TaskType.CATERING)
                .pricePerGuest(BigDecimal.valueOf(100))
                .numberOfGuests(50)
                .mealType("BUFFET")
                .build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of());
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = taskService.updateTask(10L, 100L, dto, user);

        assertEquals("New Name", result.get("name"));
        assertEquals(BigDecimal.valueOf(100), result.get("pricePerGuest"));
        assertEquals(PaymentMethod.ONLINE, result.get("paymentMethod"));
    }

    @Test
    void updateTaskChangesPaymentMethodWhenTaskHasNoPayment() {
        User user = User.builder().id(1L).role(UserRole.BRIDE).build();
        Task task = Task.builder()
                .id(100L)
                .type(TaskType.CATERING)
                .paymentMethod(PaymentMethod.ONLINE)
                .build();
        CreateTaskDTO dto = CreateTaskDTO.builder()
                .name("New Name")
                .type(TaskType.CATERING)
                .paymentMethod(PaymentMethod.OFFLINE)
                .build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of());
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = taskService.updateTask(10L, 100L, dto, user);

        assertEquals(PaymentMethod.OFFLINE, result.get("paymentMethod"));
    }

    @Test
    void updateTaskPlannerDoesNotOverwritePaymentMethod() {
        User user = User.builder().id(1L).role(UserRole.PLANNER).build();
        Task task = Task.builder()
                .id(100L)
                .type(TaskType.CATERING)
                .paymentMethod(PaymentMethod.OFFLINE)
                .build();
        CreateTaskDTO dto = CreateTaskDTO.builder()
                .name("Catering")
                .type(TaskType.CATERING)
                .paymentMethod(PaymentMethod.ONLINE)
                .build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = taskService.updateTask(10L, 100L, dto, user);

        assertEquals(PaymentMethod.OFFLINE, result.get("paymentMethod"));
    }

    @Test
    void updateTaskKeepsExistingPaymentMethodWhenDtoMethodIsMissing() {
        User user = User.builder().id(1L).role(UserRole.PLANNER).build();
        Task task = Task.builder()
                .id(100L)
                .type(TaskType.CATERING)
                .paymentMethod(PaymentMethod.OFFLINE)
                .build();
        CreateTaskDTO dto = CreateTaskDTO.builder()
                .name("Catering")
                .type(TaskType.CATERING)
                .build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = taskService.updateTask(10L, 100L, dto, user);

        assertEquals(PaymentMethod.OFFLINE, result.get("paymentMethod"));
    }

    @Test
    void updateTaskIsBlockedByPendingPayment() {
        User user = User.builder().id(1L).role(UserRole.BRIDE).build();
        Task task = Task.builder().id(100L).type(TaskType.CATERING).build();
        Payment payment = Payment.builder().status(PaymentStatus.PENDING).build();
        Expense expense = Expense.builder().task(task).payment(payment).build();
        CreateTaskDTO dto = CreateTaskDTO.builder().name("Changed").type(TaskType.CATERING).build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of(expense));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> taskService.updateTask(10L, 100L, dto, user)
        );

        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTaskIsBlockedBySuccessfulPayment() {
        User user = User.builder().id(1L).role(UserRole.BRIDE).build();
        Task task = Task.builder().id(100L).type(TaskType.CATERING).build();
        Payment payment = Payment.builder().status(PaymentStatus.SUCCESS).build();
        Expense expense = Expense.builder().task(task).payment(payment).build();
        CreateTaskDTO dto = CreateTaskDTO.builder().name("Changed").type(TaskType.CATERING).build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of(expense));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> taskService.updateTask(10L, 100L, dto, user)
        );

        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTaskWithCancelledPaymentAllowsBrideToChangePaymentMethod() {
        User user = User.builder().id(1L).role(UserRole.BRIDE).build();
        Task task = Task.builder()
                .id(100L)
                .type(TaskType.CATERING)
                .paymentMethod(PaymentMethod.ONLINE)
                .build();
        Payment payment = Payment.builder().status(PaymentStatus.CANCELLED).build();
        Expense expense = Expense.builder().task(task).payment(payment).build();
        CreateTaskDTO dto = CreateTaskDTO.builder()
                .name("Changed")
                .type(TaskType.CATERING)
                .paymentMethod(PaymentMethod.OFFLINE)
                .build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of(expense));
        when(taskRepository.save(task)).thenReturn(task);

        Map<String, Object> result = taskService.updateTask(10L, 100L, dto, user);

        assertEquals("Changed", result.get("name"));
        assertEquals(PaymentMethod.OFFLINE, result.get("paymentMethod"));
        assertEquals(false, result.get("lockedByPayment"));
    }

    @Test
    void updateTaskStatusIsBlockedByPendingPayment() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder().id(100L).type(TaskType.CATERING).status("PENDING").build();
        Payment payment = Payment.builder().status(PaymentStatus.PENDING).build();
        Expense expense = Expense.builder().task(task).payment(payment).build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of(expense));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> taskService.updateTaskStatus(10L, 100L, "COMPLETED", user)
        );

        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
        verify(taskRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void updateTaskDecorationSuccess() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder().id(100L).type(TaskType.DECORATION).build();
        CreateTaskDTO dto = CreateTaskDTO.builder()
                .name("Decoration")
                .type(TaskType.DECORATION)
                .theme("Rustic")
                .totalPrice(BigDecimal.valueOf(2000))
                .performerName("Flowers Co")
                .build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = taskService.updateTask(10L, 100L, dto, user);

        assertEquals("Decoration", result.get("name"));
        assertEquals("Rustic", result.get("theme"));
    }

    @Test
    void updateTaskEntertainmentSuccess() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder().id(100L).type(TaskType.ENTERTAINMENT).build();
        CreateTaskDTO dto = CreateTaskDTO.builder()
                .name("Band")
                .type(TaskType.ENTERTAINMENT)
                .performerName("The Rockers")
                .totalPrice(BigDecimal.valueOf(5000))
                .build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = taskService.updateTask(10L, 100L, dto, user);

        assertEquals("Band", result.get("name"));
        assertEquals("The Rockers", result.get("performerName"));
    }

    @Test
    void updateTaskStatusPublishesEventOnDifference() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder().id(100L).type(TaskType.ENTERTAINMENT).status("PENDING").build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = taskService.updateTaskStatus(10L, 100L, "COMPLETED", user);

        assertEquals("COMPLETED", result.get("status"));
        verify(eventPublisher).publishEvent(any(TaskStatusChangedEvent.class));
    }

    @Test
    void updateTaskStatusNoEventWhenSame() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder().id(100L).type(TaskType.ENTERTAINMENT).status("PENDING").build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = taskService.updateTaskStatus(10L, 100L, "PENDING", user);

        assertEquals("PENDING", result.get("status"));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void deleteTaskSuccessWhenNoExpenses() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder().id(100L).build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        taskService.deleteTask(10L, 100L, user);

        verify(taskRepository).delete(task);
    }

    @Test
    void deleteTaskDeletesExpenseWithoutPayment() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder().id(100L).build();
        Expense expense = Expense.builder().id(200L).task(task).build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of(expense));

        taskService.deleteTask(10L, 100L, user);

        verify(expenseRepository).deleteAll(List.of(expense));
        verify(expenseRepository).flush();
        verify(taskRepository).delete(task);
    }

    @Test
    void deleteTaskRejectsExpenseWithPaymentHistory() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder().id(100L).build();
        Payment payment = Payment.builder().id(300L).status(PaymentStatus.CANCELLED).build();
        Expense expense = Expense.builder().id(200L).task(task).payment(payment).build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(expenseRepository.findByTaskId(100L)).thenReturn(List.of(expense));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> taskService.deleteTask(10L, 100L, user)
        );

        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
        verify(expenseRepository, never()).deleteAll(any());
        verify(taskRepository, never()).delete(any());
    }
}
