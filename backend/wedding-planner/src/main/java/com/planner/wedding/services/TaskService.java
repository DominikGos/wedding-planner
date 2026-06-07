package com.planner.wedding.services;

import com.planner.wedding.dto.CreateTaskDTO;
import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.Task;
import com.planner.wedding.events.TaskStatusChangedEvent;
import com.planner.wedding.factory.TaskFactory;
import com.planner.wedding.repositories.EventRepository;
import com.planner.wedding.repositories.TaskRepository;
import com.planner.wedding.repositories.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final EventRepository eventRepository;
    private final VendorRepository vendorRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Tworzy nowy task używając Factory Pattern
     * Factory wybiera odpowiednią implementację na podstawie TaskType
     */
    public Map<String, Object> createTask(Long eventId, CreateTaskDTO createTaskDTO) {
        // Pobranie eventu
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        // Pobierz odpowiednią fabrykę na podstawie typu
        TaskFactory factory = TaskFactory.getFactory(createTaskDTO.getType());

        // Fabryka waliduje DTO
        factory.validateDTO(createTaskDTO);

        // Fabryka tworzy Task
        Task task = factory.createFromDTO(createTaskDTO);
        task.setEvent(event);

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
        return factory.convertToDTO(savedTask);
    }

    /**
     * Pobiera wszystkie taski dla eventu
     */
    public List<Map<String, Object>> getTasksByEvent(Long eventId) {
        List<Task> tasks = taskRepository.findByEventId(eventId);

        return tasks.stream()
                .map(task -> {
                    TaskFactory factory = TaskFactory.getFactory(task.getType());
                    return factory.convertToDTO(task);
                })
                .collect(Collectors.toList());
    }

    /**
     * Pobiera wszystkie taski dla eventu w postaci posortowanego harmonogramu
     */
    public List<Map<String, Object>> getTaskSchedule(Long eventId) {
        List<Task> tasks = taskRepository.findByEventId(eventId);
        
        // Zastosowanie wzorca Singleton
        List<Task> scheduledTasks = ScheduleGenerator.getInstance().generateSchedule(tasks);

        return scheduledTasks.stream()
                .map(task -> {
                    TaskFactory factory = TaskFactory.getFactory(task.getType());
                    return factory.convertToDTO(task);
                })
                .collect(Collectors.toList());
    }

    /**
     * Pobiera konkretny task
     */
    public Map<String, Object> getTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        TaskFactory factory = TaskFactory.getFactory(task.getType());
        return factory.convertToDTO(task);
    }

    /**
     * Aktualizuje task
     */
    public Map<String, Object> updateTask(Long taskId, CreateTaskDTO createTaskDTO) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        // Update fields
        task.setName(createTaskDTO.getName());
        task.setDescription(createTaskDTO.getDescription());
        task.setDueDate(createTaskDTO.getDueDate());
        task.setPriority(createTaskDTO.getPriority());

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

        TaskFactory factory = TaskFactory.getFactory(updatedTask.getType());
        return factory.convertToDTO(updatedTask);
    }

    /**
     * Usuwa task
     */
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found with id: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    /**
     * Zmienia status tasku
     */
    public Map<String, Object> updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        String previousStatus = task.getStatus();
        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);

        if (!Objects.equals(previousStatus, status)) {
            eventPublisher.publishEvent(new TaskStatusChangedEvent(updatedTask, previousStatus, status));
        }

        TaskFactory factory = TaskFactory.getFactory(updatedTask.getType());
        return factory.convertToDTO(updatedTask);
    }
}
