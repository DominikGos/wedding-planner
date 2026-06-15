package com.planner.wedding.integration;

import com.planner.wedding.dto.*;
import com.planner.wedding.entities.PaymentMethod;
import com.planner.wedding.entities.PaymentStatus;
import com.planner.wedding.services.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class PaymentControllerIntegrationTest extends BaseIntegrationTest {

    @MockitoBean
    private PaymentService paymentService;

    @Test
    void createPaymentReturns201() {
        var request = new CreatePaymentRequest();
        request.setAmount(new BigDecimal("500.00"));
        request.setMethod(PaymentMethod.ONLINE);

        var responseDto = new PaymentResponse();
        responseDto.setId(1L);
        responseDto.setAmount(new BigDecimal("500.00"));
        responseDto.setStatus(PaymentStatus.PENDING);

        when(paymentService.createPayment(any(CreatePaymentRequest.class))).thenReturn(responseDto);

        webTestClient.post()
                .uri("/api/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.status").isEqualTo("PENDING");
    }

    @Test
    void getPaymentsReturnsList() {
        var payment = new PaymentResponse();
        payment.setId(1L);
        payment.setAmount(new BigDecimal("500.00"));

        when(paymentService.getPayments(any(), any(), any())).thenReturn(List.of(payment));

        webTestClient.get()
                .uri("/api/payments")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].id").isEqualTo(1);
    }

    @Test
    void getPaymentByIdReturnsPayment() {
        var payment = new PaymentResponse();
        payment.setId(1L);
        payment.setAmount(new BigDecimal("500.00"));

        when(paymentService.getPaymentById(eq(1L))).thenReturn(payment);

        webTestClient.get()
                .uri("/api/payments/1")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1);
    }

    @Test
    void confirmOnlinePaymentReturnsPayment() {
        var request = new ConfirmOnlinePaymentRequest();
        request.setSuccess(true);
        request.setGatewayPaymentId("gateway-123");

        var payment = new PaymentResponse();
        payment.setId(1L);
        payment.setStatus(PaymentStatus.SUCCESS);

        when(paymentService.confirmOnlinePayment(eq(1L), any(ConfirmOnlinePaymentRequest.class))).thenReturn(payment);

        webTestClient.post()
                .uri("/api/payments/1/confirm-online")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.status").isEqualTo("SUCCESS");
    }

    @Test
    void cancelPaymentReturnsPayment() {
        var payment = new PaymentResponse();
        payment.setId(1L);
        payment.setStatus(PaymentStatus.CANCELLED);

        when(paymentService.cancelPayment(eq(1L), any())).thenReturn(payment);

        webTestClient.post()
                .uri("/api/payments/1/cancel")
                .contentType(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.status").isEqualTo("CANCELLED");
    }

    @Test
    void retryPaymentReturnsPayment() {
        var payment = new PaymentResponse();
        payment.setId(1L);
        payment.setStatus(PaymentStatus.PENDING);

        when(paymentService.retryPayment(eq(1L))).thenReturn(payment);

        webTestClient.post()
                .uri("/api/payments/1/retry")
                .contentType(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.status").isEqualTo("PENDING");
    }

    @Test
    void approveOfflinePaymentReturnsPayment() {
        var payment = new PaymentResponse();
        payment.setId(1L);
        payment.setStatus(PaymentStatus.OFFLINE_APPROVED);

        when(paymentService.approveOfflinePayment(eq(1L), any())).thenReturn(payment);

        webTestClient.post()
                .uri("/api/payments/1/offline-approve")
                .contentType(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.status").isEqualTo("OFFLINE_APPROVED");
    }

    @Test
    void getSummaryReturnsSummary() {
        var summary = new PaymentSummaryResponse();
        summary.setTotalAmount(new BigDecimal("1000.00"));

        when(paymentService.getSummary()).thenReturn(summary);

        webTestClient.get()
                .uri("/api/payments/summary")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.totalAmount").isEqualTo(1000.00);
    }
}
