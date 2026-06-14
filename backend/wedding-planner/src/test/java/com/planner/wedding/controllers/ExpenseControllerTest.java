package com.planner.wedding.controllers;

import tools.jackson.databind.ObjectMapper;
import com.planner.wedding.dto.CreateExpenseRequest;
import com.planner.wedding.dto.ExpenseResponse;
import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import com.planner.wedding.services.ExpenseService;
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

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ExpenseController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        OAuth2ClientAutoConfiguration.class,
        OAuth2ClientWebSecurityAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(ExpenseControllerTest.TestConfig.class)
class ExpenseControllerTest {

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
    private ExpenseService expenseService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private CustomOAuth2UserService customOAuth2UserService;

    @MockitoBean
    private OAuthSuccessHandler oAuthSuccessHandler;

    @Test
    void getExpensesReturnsList() throws Exception {
        ExpenseResponse response = new ExpenseResponse();
        response.setId(1L);
        response.setAmount(BigDecimal.valueOf(250.00));

        when(expenseService.getExpenses(eq(5L), eq(10L), any(User.class))).thenReturn(List.of(response));

        mockMvc.perform(get("/api/expenses")
                        .param("taskId", "5")
                        .param("eventId", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].amount").value(250.00));
    }

    @Test
    void getExpenseByIdReturnsExpense() throws Exception {
        ExpenseResponse response = new ExpenseResponse();
        response.setId(1L);

        when(expenseService.getExpenseById(eq(1L), any(User.class))).thenReturn(response);

        mockMvc.perform(get("/api/expenses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void createExpenseReturns201() throws Exception {
        CreateExpenseRequest input = new CreateExpenseRequest();
        input.setTaskId(5L);
        input.setAmount(BigDecimal.valueOf(100));

        ExpenseResponse response = new ExpenseResponse();
        response.setId(1L);
        response.setAmount(BigDecimal.valueOf(100));

        when(expenseService.createExpense(any(CreateExpenseRequest.class), any(User.class))).thenReturn(response);

        mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.amount").value(100));
    }

    @Test
    void updateExpenseReturnsExpense() throws Exception {
        CreateExpenseRequest input = new CreateExpenseRequest();
        input.setAmount(BigDecimal.valueOf(150));

        ExpenseResponse response = new ExpenseResponse();
        response.setId(1L);
        response.setAmount(BigDecimal.valueOf(150));

        when(expenseService.updateExpense(eq(1L), any(CreateExpenseRequest.class), any(User.class))).thenReturn(response);

        mockMvc.perform(put("/api/expenses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.amount").value(150));
    }

    @Test
    void deleteExpenseReturns244() throws Exception {
        mockMvc.perform(delete("/api/expenses/1"))
                .andExpect(status().isNoContent());

        verify(expenseService).deleteExpense(eq(1L), any(User.class));
    }
}
