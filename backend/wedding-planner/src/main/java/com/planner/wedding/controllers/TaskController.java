package com.planner.wedding.controllers;

import com.planner.wedding.dto.CreateTaskDTO;
import com.planner.wedding.entities.User;
import com.planner.wedding.services.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Task REST Controller
 * Endpoints do zarządzania taskami (Factory Pattern w Service)
 */
@RestController
@RequestMapping("/api/events/{eventId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * GET /api/events/{eventId}/tasks
     * Pobiera wszystkie taski dla danego eventu
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getTasksByEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal User user
    ) {
        List<Map<String, Object>> tasks = taskService.getTasksByEvent(eventId, user);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/events/{eventId}/tasks/schedule
     * Pobiera harmonogram tasków (posortowane po dacie i priorytecie)
     */
    @GetMapping("/schedule")
    public ResponseEntity<List<Map<String, Object>>> getTaskSchedule(
            @PathVariable Long eventId,
            @AuthenticationPrincipal User user
    ) {
        List<Map<String, Object>> schedule = taskService.getTaskSchedule(eventId, user);
        return ResponseEntity.ok(schedule);
    }

    /**
     * POST /api/events/{eventId}/tasks
     * Tworzy nowy task (Factory Pattern)
     *
     * Przykład body:
     * {
     *   "type": "CATERING",
     *   "name": "Wedding Catering",
     *   "description": "Main dinner for 150 guests",
     *   "dueDate": "2026-06-15T18:00:00",
     *   "priority": 1,
     *   "pricePerGuest": 45.00,
     *   "numberOfGuests": 150,
     *   "mealType": "MIXED"
     * }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTask(
            @PathVariable Long eventId,
            @RequestBody CreateTaskDTO createTaskDTO,
            @AuthenticationPrincipal User user
    ) {
        Map<String, Object> task = taskService.createTask(eventId, createTaskDTO, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    /**
     * GET /api/events/{eventId}/tasks/{taskId}
     * Pobiera konkretny task
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<Map<String, Object>> getTask(
            @PathVariable Long eventId,
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user
    ) {
        Map<String, Object> task = taskService.getTask(eventId, taskId, user);
        return ResponseEntity.ok(task);
    }

    /**
     * PUT /api/events/{eventId}/tasks/{taskId}
     * Aktualizuje task
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<Map<String, Object>> updateTask(
            @PathVariable Long eventId,
            @PathVariable Long taskId,
            @RequestBody CreateTaskDTO createTaskDTO,
            @AuthenticationPrincipal User user
    ) {
        Map<String, Object> updatedTask = taskService.updateTask(eventId, taskId, createTaskDTO, user);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * DELETE /api/events/{eventId}/tasks/{taskId}
     * Usuwa task
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long eventId,
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user
    ) {
        taskService.deleteTask(eventId, taskId, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/events/{eventId}/tasks/{taskId}/status
     * Zmienia status tasku
     *
     * Przykład body:
     * {
     *   "status": "IN_PROGRESS"
     * }
     */
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<Map<String, Object>> updateTaskStatus(
            @PathVariable Long eventId,
            @PathVariable Long taskId,
            @RequestBody StatusUpdateDTO statusUpdate,
            @AuthenticationPrincipal User user
    ) {
        Map<String, Object> updatedTask = taskService.updateTaskStatus(eventId, taskId, statusUpdate.getStatus(), user);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Helper DTO do zmiany statusu
     */
    public static class StatusUpdateDTO {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
