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
        User user = User.builder().id(1L).build();
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
        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));

        Map<String, Object> result = taskService.getTask(10L, 100L, user);

        assertEquals(100L, result.get("id"));
        verify(eventService).requireOwnedEvent(10L, user);
    }

    @Test
    void updateTaskCateringSuccess() {
        User user = User.builder().id(1L).build();
        Task task = Task.builder().id(100L).type(TaskType.CATERING).build();
        CreateTaskDTO dto = CreateTaskDTO.builder()
                .name("New Name")
                .type(TaskType.CATERING)
                .pricePerGuest(BigDecimal.valueOf(100))
                .numberOfGuests(50)
                .mealType("BUFFET")
                .build();

        when(taskRepository.findByIdAndEventId(100L, 10L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = taskService.updateTask(10L, 100L, dto, user);

        assertEquals("New Name", result.get("name"));
        assertEquals(BigDecimal.valueOf(100), result.get("pricePerGuest"));
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
        when(expenseRepository.existsByTaskId(100L)).thenReturn(false);

        taskService.deleteTask(10L, 100L, user);

        verify(taskRepository).delete(task);
    }
}
