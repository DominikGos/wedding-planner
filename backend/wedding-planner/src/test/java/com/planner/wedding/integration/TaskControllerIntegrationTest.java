package com.planner.wedding.integration;

import com.planner.wedding.dto.CreateTaskDTO;
import com.planner.wedding.services.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TaskControllerIntegrationTest extends BaseIntegrationTest {

    @MockitoBean
    private TaskService taskService;

    @Test
    void getTasksByEventReturnsList() {
        var taskMap = Map.of("id", 1, "name", "Rent Tent");
        when(taskService.getTasksByEvent(eq(10L), any())).thenReturn(List.of((Map) taskMap));

        webTestClient.get()
                .uri("/api/events/10/tasks")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].id").isEqualTo(1)
                .jsonPath("$[0].name").isEqualTo("Rent Tent");
    }

    @Test
    void getTaskScheduleReturnsSchedule() {
        var taskMap = Map.of("id", 2, "name", "Hire Catering");
        when(taskService.getTaskSchedule(eq(10L), any())).thenReturn(List.of((Map) taskMap));

        webTestClient.get()
                .uri("/api/events/10/tasks/schedule")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].id").isEqualTo(2)
                .jsonPath("$[0].name").isEqualTo("Hire Catering");
    }

    @Test
    void createTaskReturns201() {
        var input = CreateTaskDTO.builder().name("New Task").build();
        var taskMap = Map.<String, Object>of("id", 100, "name", "New Task");
        when(taskService.createTask(eq(10L), any(CreateTaskDTO.class), any())).thenReturn(taskMap);

        webTestClient.post()
                .uri("/api/events/10/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(input)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.id").isEqualTo(100)
                .jsonPath("$.name").isEqualTo("New Task");
    }

    @Test
    void getTaskReturnsTask() {
        var taskMap = Map.<String, Object>of("id", 1);
        when(taskService.getTask(eq(10L), eq(1L), any())).thenReturn(taskMap);

        webTestClient.get()
                .uri("/api/events/10/tasks/1")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1);
    }

    @Test
    void updateTaskReturnsTask() {
        var input = CreateTaskDTO.builder().name("Updated Task").build();
        var taskMap = Map.<String, Object>of("id", 1, "name", "Updated Task");
        when(taskService.updateTask(eq(10L), eq(1L), any(CreateTaskDTO.class), any())).thenReturn(taskMap);

        webTestClient.put()
                .uri("/api/events/10/tasks/1")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(input)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.name").isEqualTo("Updated Task");
    }

    @Test
    void deleteTaskReturns204() {
        webTestClient.delete()
                .uri("/api/events/10/tasks/1")
                .exchange()
                .expectStatus().isNoContent();

        verify(taskService).deleteTask(eq(10L), eq(1L), any());
    }

    @Test
    void updateTaskStatusReturnsTask() {
        var statusDto = Map.of("status", "COMPLETED");
        var taskMap = Map.<String, Object>of("id", 1, "status", "COMPLETED");
        when(taskService.updateTaskStatus(eq(10L), eq(1L), eq("COMPLETED"), any())).thenReturn(taskMap);

        webTestClient.patch()
                .uri("/api/events/10/tasks/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(statusDto)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.status").isEqualTo("COMPLETED");
    }
}
