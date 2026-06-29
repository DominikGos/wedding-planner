package com.planner.wedding.services;

import com.planner.wedding.dto.CreateTaskDTO;
import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.Expense;
import com.planner.wedding.entities.PaymentMethod;
import com.planner.wedding.entities.PaymentStatus;
import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import com.planner.wedding.events.TaskStatusChangedEvent;
import com.planner.wedding.factory.TaskFactory;
import com.planner.wedding.repositories.ExpenseRepository;
import com.planner.wedding.repositories.TaskRepository;
import com.planner.wedding.repositories.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Task Service - Business Logic Layer
 * Korzysta z Factory Pattern do tworzenia różnych typów tasków
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ExpenseRepository expenseRepository;
    private final VendorRepository vendorRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final EventService eventService;

    /**
     * Tworzy nowy task używając Factory Pattern
     * Factory wybiera odpowiednią implementację na podstawie TaskType
     */
    public Map<String, Object> createTask(Long eventId, CreateTaskDTO createTaskDTO, User user) {
        Event event = eventService.requireOwnedEvent(eventId, user);

        // Pobierz odpowiednią fabrykę na podstawie typu
        TaskFactory factory = TaskFactory.getFactory(createTaskDTO.getType());

        // Fabryka waliduje DTO
        factory.validateDTO(createTaskDTO);

        // Fabryka tworzy Task
        Task task = factory.createFromDTO(createTaskDTO);
        task.setEvent(event);
        task.setPaymentMethod(resolvePaymentMethod(createTaskDTO, null));

        // Jeśli podano vendorId, przypisz dostawcę
        if (createTaskDTO.getVendorId() != null) {
            task.setVendor(
                    vendorRepository.findById(createTaskDTO.getVendorId())
                            .orElseThrow(() -> new RuntimeException("Vendor not found"))
            );
        }

        // Zapisz task
        Task savedTask = taskRepository.save(task);

        // Konwertuj z powrotem do DTO używając fabryki
        return mapTask(savedTask);
    }

    /**
     * Pobiera wszystkie taski dla eventu
     */
    public List<Map<String, Object>> getTasksByEvent(Long eventId, User user) {
        eventService.requireOwnedEvent(eventId, user);
        List<Task> tasks = taskRepository.findByEventId(eventId);

        return tasks.stream()
                .map(this::mapTask)
                .collect(Collectors.toList());
    }

    /**
     * Pobiera wszystkie taski dla eventu w postaci posortowanego harmonogramu
     */
    public List<Map<String, Object>> getTaskSchedule(Long eventId, User user) {
        eventService.requireOwnedEvent(eventId, user);
        List<Task> tasks = taskRepository.findByEventId(eventId);
        
        // Zastosowanie wzorca Singleton
        List<Task> scheduledTasks = ScheduleGenerator.getInstance().generateSchedule(tasks);

        return scheduledTasks.stream()
                .map(this::mapTask)
                .collect(Collectors.toList());
    }

    /**
     * Pobiera konkretny task
     */
    public Map<String, Object> getTask(Long eventId, Long taskId, User user) {
        eventService.requireOwnedEvent(eventId, user);
        Task task = requireTask(eventId, taskId);

        return mapTask(task);
    }

    /**
     * Aktualizuje task
     */
    public Map<String, Object> updateTask(Long eventId, Long taskId, CreateTaskDTO createTaskDTO, User user) {
        eventService.requireOwnedEvent(eventId, user);
        Task task = requireTask(eventId, taskId);
        if (isTaskLockedByPayment(taskId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Task cannot be edited because it has active or completed payment"
            );
        }

        // Update fields
        task.setName(createTaskDTO.getName());
        task.setDescription(createTaskDTO.getDescription());
        task.setDueDate(createTaskDTO.getDueDate());
        task.setPriority(createTaskDTO.getPriority());
        if (user.getRole() != UserRole.PLANNER) {
            task.setPaymentMethod(resolvePaymentMethod(createTaskDTO, task.getPaymentMethod()));
        } else if (task.getPaymentMethod() == null) {
            task.setPaymentMethod(PaymentMethod.ONLINE);
        }

        // Update type-specific fields
        if (task.getType() == createTaskDTO.getType()) {
            switch (task.getType()) {
                case CATERING:
                    task.setPricePerGuest(createTaskDTO.getPricePerGuest());
                    task.setNumberOfGuests(createTaskDTO.getNumberOfGuests());
                    task.setMealType(createTaskDTO.getMealType());
                    break;
                case DECORATION:
                    task.setTheme(createTaskDTO.getTheme());
                    task.setTotalPrice(createTaskDTO.getTotalPrice());
                    task.setPerformerName(createTaskDTO.getPerformerName());
                    break;
                case ENTERTAINMENT:
                    task.setPerformerName(createTaskDTO.getPerformerName());
                    task.setTotalPrice(createTaskDTO.getTotalPrice());
                    break;
            }
        }

        Task updatedTask = taskRepository.save(task);

        return mapTask(updatedTask);
    }

    /**
     * Usuwa task
     */
    public void deleteTask(Long eventId, Long taskId, User user) {
        eventService.requireOwnedEvent(eventId, user);
        Task task = requireTask(eventId, taskId);
        List<Expense> expenses = expenseRepository.findByTaskId(taskId);
        if (expenses.stream().anyMatch(expense -> expense.getPayment() != null)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Task cannot be deleted because it has payment history"
            );
        }
        expenseRepository.deleteAll(expenses);
        expenseRepository.flush();
        taskRepository.delete(task);
    }

    /**
     * Zmienia status tasku
     */
    public Map<String, Object> updateTaskStatus(Long eventId, Long taskId, String status, User user) {
        eventService.requireOwnedEvent(eventId, user);
        Task task = requireTask(eventId, taskId);
        if (isTaskLockedByPayment(taskId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Task cannot be edited because it has active or completed payment"
            );
        }

        String previousStatus = task.getStatus();
        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);

        if (!Objects.equals(previousStatus, status)) {
            eventPublisher.publishEvent(new TaskStatusChangedEvent(updatedTask, previousStatus, status));
        }

        return mapTask(updatedTask);
    }

    private Task requireTask(Long eventId, Long taskId) {
        return taskRepository.findByIdAndEventId(taskId, eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    private boolean isTaskLockedByPayment(Long taskId) {
        return expenseRepository.findByTaskId(taskId).stream()
                .anyMatch(expense -> expense.getPayment() != null
                        && expense.getPayment().getStatus() != PaymentStatus.CANCELLED);
    }

    private Map<String, Object> mapTask(Task task) {
        Map<String, Object> response = TaskFactory.getFactory(task.getType()).convertToDTO(task);
        response.put("lockedByPayment", isTaskLockedByPayment(task.getId()));
        return response;
    }

    private PaymentMethod resolvePaymentMethod(CreateTaskDTO dto, PaymentMethod currentPaymentMethod) {
        if (dto.getPaymentMethod() != null) {
            return dto.getPaymentMethod();
        }
        return currentPaymentMethod != null ? currentPaymentMethod : PaymentMethod.ONLINE;
    }
}
