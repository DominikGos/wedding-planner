package com.planner.wedding.controllers;

import tools.jackson.databind.ObjectMapper;
import com.planner.wedding.dto.*;
import com.planner.wedding.entities.PaymentStatus;
import com.planner.wedding.services.PaymentService;
import com.planner.wedding.services.JwtService;
import com.planner.wedding.repositories.UserRepository;
import com.planner.wedding.services.CustomOAuth2UserService;
import com.planner.wedding.config.OAuthSuccessHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PaymentController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        OAuth2ClientAutoConfiguration.class,
        OAuth2ClientWebSecurityAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PaymentService paymentService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private CustomOAuth2UserService customOAuth2UserService;

    @MockitoBean
    private OAuthSuccessHandler oAuthSuccessHandler;

    @Test
    void createPaymentReturns201() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setExpenseId(10L);
        request.setAmount(BigDecimal.valueOf(100));

        PaymentResponse response = new PaymentResponse();
        response.setId(1L);
        response.setAmount(BigDecimal.valueOf(100));

        when(paymentService.createPayment(any(CreatePaymentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.amount").value(100));
    }

    @Test
    void getPaymentsReturnsList() throws Exception {
        PaymentResponse response = new PaymentResponse();
        response.setId(1L);
        response.setStatus(PaymentStatus.SUCCESS);

        when(paymentService.getPayments(eq(PaymentStatus.SUCCESS), eq(2L), eq(3L)))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/payments")
                        .param("status", "SUCCESS")
                        .param("vendorId", "2")
                        .param("eventId", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].status").value("SUCCESS"));
    }

    @Test
    void getPaymentByIdReturnsPayment() throws Exception {
        PaymentResponse response = new PaymentResponse();
        response.setId(1L);

        when(paymentService.getPaymentById(eq(1L))).thenReturn(response);

        mockMvc.perform(get("/api/payments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void confirmOnlinePaymentReturnsPayment() throws Exception {
        ConfirmOnlinePaymentRequest request = new ConfirmOnlinePaymentRequest();
        request.setGatewayPaymentId("gw-123");
        request.setSuccess(true);

        PaymentResponse response = new PaymentResponse();
        response.setId(1L);
        response.setStatus(PaymentStatus.SUCCESS);

        when(paymentService.confirmOnlinePayment(eq(1L), any(ConfirmOnlinePaymentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/payments/1/confirm-online")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    void cancelPaymentReturnsPayment() throws Exception {
        CancelPaymentRequest request = new CancelPaymentRequest();
        request.setReason("Changed mind");

        PaymentResponse response = new PaymentResponse();
        response.setId(1L);
        response.setStatus(PaymentStatus.CANCELLED);

        when(paymentService.cancelPayment(eq(1L), any(CancelPaymentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/payments/1/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void retryPaymentReturnsPayment() throws Exception {
        PaymentResponse response = new PaymentResponse();
        response.setId(2L);
        response.setStatus(PaymentStatus.PENDING);

        when(paymentService.retryPayment(eq(1L))).thenReturn(response);

        mockMvc.perform(post("/api/payments/1/retry"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2L))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void approveOfflinePaymentReturnsPayment() throws Exception {
        OfflineApprovePaymentRequest request = new OfflineApprovePaymentRequest();
        request.setApprovedBy("ADMIN");

        PaymentResponse response = new PaymentResponse();
        response.setId(1L);
        response.setStatus(PaymentStatus.OFFLINE_APPROVED);

        when(paymentService.approveOfflinePayment(eq(1L), any(OfflineApprovePaymentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/payments/1/offline-approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("OFFLINE_APPROVED"));
    }

    @Test
    void getSummaryReturnsSummary() throws Exception {
        PaymentSummaryResponse response = new PaymentSummaryResponse();
        response.setTotalAmount(BigDecimal.valueOf(100));
        response.setSuccessAmount(BigDecimal.valueOf(80));

        when(paymentService.getSummary()).thenReturn(response);

        mockMvc.perform(get("/api/payments/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(100))
                .andExpect(jsonPath("$.successAmount").value(80));
    }
}
