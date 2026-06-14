package com.planner.wedding.controllers;

import tools.jackson.databind.ObjectMapper;
import com.planner.wedding.dto.CreateTaskDTO;
import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import com.planner.wedding.services.TaskService;
import com.planner.wedding.services.JwtService;
import com.planner.wedding.repositories.UserRepository;
import com.planner.wedding.services.CustomOAuth2UserService;
import com.planner.wedding.config.OAuthSuccessHandler;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TaskController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        OAuth2ClientAutoConfiguration.class,
        OAuth2ClientWebSecurityAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(TaskControllerTest.TestConfig.class)
class TaskControllerTest {

    @TestConfiguration
    static class TestConfig implements org.springframework.web.servlet.config.annotation.WebMvcConfigurer {
        @Override
        public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
            resolvers.add(new HandlerMethodArgumentResolver() {
                @Override
                public boolean supportsParameter(MethodParameter parameter) {
                    return parameter.getParameterType().equals(User.class)
                            && parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
                }

                @Override
                public Object resolveArgument(MethodParameter parameter,
                                               ModelAndViewContainer mavContainer,
                                               NativeWebRequest webRequest,
                                               WebDataBinderFactory binderFactory) {
                    return User.builder()
                            .id(7L)
                            .email("test@example.com")
                            .role(UserRole.PLANNER)
                            .build();
                }
            });
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TaskService taskService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private CustomOAuth2UserService customOAuth2UserService;

    @MockitoBean
    private OAuthSuccessHandler oAuthSuccessHandler;

    @Test
    void getTasksByEventReturnsList() throws Exception {
        Map<String, Object> taskMap = new HashMap<>();
        taskMap.put("id", 1L);
        taskMap.put("name", "Rent Tent");

        when(taskService.getTasksByEvent(eq(10L), any(User.class))).thenReturn(List.of(taskMap));

        mockMvc.perform(get("/api/events/10/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Rent Tent"));
    }

    @Test
    void getTaskScheduleReturnsSchedule() throws Exception {
        Map<String, Object> taskMap = new HashMap<>();
        taskMap.put("id", 2L);
        taskMap.put("name", "Hire Catering");

        when(taskService.getTaskSchedule(eq(10L), any(User.class))).thenReturn(List.of(taskMap));

        mockMvc.perform(get("/api/events/10/tasks/schedule"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2L))
                .andExpect(jsonPath("$[0].name").value("Hire Catering"));
    }

    @Test
    void createTaskReturns201() throws Exception {
        CreateTaskDTO input = CreateTaskDTO.builder().name("New Task").build();
        Map<String, Object> taskMap = new HashMap<>();
        taskMap.put("id", 100L);
        taskMap.put("name", "New Task");

        when(taskService.createTask(eq(10L), any(CreateTaskDTO.class), any(User.class))).thenReturn(taskMap);

        mockMvc.perform(post("/api/events/10/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.name").value("New Task"));
    }

    @Test
    void getTaskReturnsTask() throws Exception {
        Map<String, Object> taskMap = new HashMap<>();
        taskMap.put("id", 1L);

        when(taskService.getTask(eq(10L), eq(1L), any(User.class))).thenReturn(taskMap);

        mockMvc.perform(get("/api/events/10/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void updateTaskReturnsTask() throws Exception {
        CreateTaskDTO input = CreateTaskDTO.builder().name("Updated Task").build();
        Map<String, Object> taskMap = new HashMap<>();
        taskMap.put("id", 1L);
        taskMap.put("name", "Updated Task");

        when(taskService.updateTask(eq(10L), eq(1L), any(CreateTaskDTO.class), any(User.class))).thenReturn(taskMap);

        mockMvc.perform(put("/api/events/10/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Updated Task"));
    }

    @Test
    void deleteTaskReturns204() throws Exception {
        mockMvc.perform(delete("/api/events/10/tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask(eq(10L), eq(1L), any(User.class));
    }

    @Test
    void updateTaskStatusReturnsTask() throws Exception {
        TaskController.StatusUpdateDTO statusDto = new TaskController.StatusUpdateDTO();
        statusDto.setStatus("COMPLETED");

        Map<String, Object> taskMap = new HashMap<>();
        taskMap.put("id", 1L);
        taskMap.put("status", "COMPLETED");

        when(taskService.updateTaskStatus(eq(10L), eq(1L), eq("COMPLETED"), any(User.class))).thenReturn(taskMap);

        mockMvc.perform(patch("/api/events/10/tasks/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }
}
