package com.planner.wedding.services;

import com.planner.wedding.dto.*;
import com.planner.wedding.entities.*;
import com.planner.wedding.repositories.ExpenseRepository;
import com.planner.wedding.repositories.PaymentRepository;
import com.planner.wedding.repositories.VendorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private PaymentGatewayClient paymentGatewayClient;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void createPaymentOnlineSuccess() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setExpenseId(10L);
        request.setVendorId(20L);
        request.setAmount(BigDecimal.valueOf(100.50));
        request.setMethod(PaymentMethod.ONLINE);
        request.setCurrency("USD");

        Expense expense = Expense.builder().id(10L).build();
        Vendor vendor = Vendor.builder().id(20L).build();

        when(expenseRepository.findById(10L)).thenReturn(Optional.of(expense));
        when(vendorRepository.findById(20L)).thenReturn(Optional.of(vendor));
        when(paymentGatewayClient.createSandboxPayment(BigDecimal.valueOf(100.50), "USD")).thenReturn("gw-123");
        
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(100L);
            return p;
        });

        PaymentResponse response = paymentService.createPayment(request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
        assertEquals("gw-123", response.getGatewayPaymentId());
        assertEquals("USD", response.getCurrency());
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void createPaymentOfflineSuccess() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setExpenseId(10L);
        request.setVendorId(20L);
        request.setAmount(BigDecimal.valueOf(500.00));
        request.setMethod(PaymentMethod.OFFLINE);
        request.setCurrency("");

        Expense expense = Expense.builder().id(10L).build();
        Vendor vendor = Vendor.builder().id(20L).build();

        when(expenseRepository.findById(10L)).thenReturn(Optional.of(expense));
        when(vendorRepository.findById(20L)).thenReturn(Optional.of(vendor));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(101L);
            return p;
        });

        PaymentResponse response = paymentService.createPayment(request);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals(PaymentStatus.OFFLINE, response.getStatus());
        assertNull(response.getGatewayPaymentId());
        assertEquals("PLN", response.getCurrency()); // defaults to PLN
    }

    @Test
    void createPaymentThrowsExceptionWhenAmountIsNegativeOrZero() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setExpenseId(10L);
        request.setVendorId(20L);
        request.setAmount(BigDecimal.ZERO);
        request.setMethod(PaymentMethod.ONLINE);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            paymentService.createPayment(request);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Amount must be greater than 0"));
    }

    @Test
    void createPaymentThrowsExceptionWhenExpenseNotFound() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setExpenseId(10L);
        request.setVendorId(20L);
        request.setAmount(BigDecimal.TEN);
        request.setMethod(PaymentMethod.ONLINE);

        when(expenseRepository.findById(10L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            paymentService.createPayment(request);
        });

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void confirmOnlinePaymentSuccess() {
        Payment payment = Payment.builder()
                .id(1L)
                .method(PaymentMethod.ONLINE)
                .status(PaymentStatus.PENDING)
                .gatewayPaymentId("gw-123")
                .build();

        ConfirmOnlinePaymentRequest request = new ConfirmOnlinePaymentRequest();
        request.setGatewayPaymentId("gw-123");
        request.setSuccess(true);

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.confirmOnlinePayment(1L, request);

        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertNull(response.getFailureReason());
    }

    @Test
    void confirmOnlinePaymentFailure() {
        Payment payment = Payment.builder()
                .id(1L)
                .method(PaymentMethod.ONLINE)
                .status(PaymentStatus.PENDING)
                .gatewayPaymentId("gw-123")
                .build();

        ConfirmOnlinePaymentRequest request = new ConfirmOnlinePaymentRequest();
        request.setGatewayPaymentId("gw-123");
        request.setSuccess(false);
        request.setFailureReason("Insufficient funds");

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.confirmOnlinePayment(1L, request);

        assertEquals(PaymentStatus.FAILED, response.getStatus());
        assertEquals("Insufficient funds", response.getFailureReason());
    }

    @Test
    void confirmOnlinePaymentThrowsExceptionWhenNotOnline() {
        Payment payment = Payment.builder()
                .id(1L)
                .method(PaymentMethod.OFFLINE)
                .status(PaymentStatus.PENDING)
                .build();

        ConfirmOnlinePaymentRequest request = new ConfirmOnlinePaymentRequest();

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            paymentService.confirmOnlinePayment(1L, request);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Only online payments"));
    }

    @Test
    void cancelPaymentSuccess() {
        Payment payment = Payment.builder()
                .id(1L)
                .status(PaymentStatus.PENDING)
                .build();

        CancelPaymentRequest request = new CancelPaymentRequest();
        request.setReason("User changed mind");

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.cancelPayment(1L, request);

        assertEquals(PaymentStatus.CANCELLED, response.getStatus());
        assertEquals("User changed mind", response.getFailureReason());
    }

    @Test
    void cancelPaymentThrowsExceptionWhenInvalidStatus() {
        Payment payment = Payment.builder()
                .id(1L)
                .status(PaymentStatus.SUCCESS)
                .build();

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            paymentService.cancelPayment(1L, null);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void retryPaymentSuccess() {
        Expense expense = Expense.builder().id(10L).build();
        Vendor vendor = Vendor.builder().id(20L).build();
        Payment original = Payment.builder()
                .id(1L)
                .status(PaymentStatus.FAILED)
                .method(PaymentMethod.ONLINE)
                .amount(BigDecimal.TEN)
                .currency("PLN")
                .expense(expense)
                .vendor(vendor)
                .build();

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(original));
        when(paymentGatewayClient.createSandboxPayment(BigDecimal.TEN, "PLN")).thenReturn("new-gw-id");
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.retryPayment(1L);

        assertNotNull(response);
        assertEquals(PaymentStatus.PENDING, response.getStatus());
        assertEquals("new-gw-id", response.getGatewayPaymentId());
    }

    @Test
    void approveOfflinePaymentSuccess() {
        Payment payment = Payment.builder()
                .id(1L)
                .status(PaymentStatus.OFFLINE)
                .method(PaymentMethod.OFFLINE)
                .build();

        OfflineApprovePaymentRequest request = new OfflineApprovePaymentRequest();
        request.setApprovedBy("TEST_ADMIN");

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.approveOfflinePayment(1L, request);

        assertEquals(PaymentStatus.OFFLINE_APPROVED, response.getStatus());
        assertEquals("TEST_ADMIN", response.getApprovedBy());
        assertNotNull(response.getApprovedAt());
    }

    @Test
    void getSummaryCalculatesCorrectly() {
        Payment p1 = Payment.builder().status(PaymentStatus.SUCCESS).amount(BigDecimal.valueOf(100)).build();
        Payment p2 = Payment.builder().status(PaymentStatus.PENDING).amount(BigDecimal.valueOf(50)).build();
        Payment p3 = Payment.builder().status(PaymentStatus.FAILED).amount(BigDecimal.valueOf(25)).build();

        when(paymentRepository.findAll()).thenReturn(List.of(p1, p2, p3));

        PaymentSummaryResponse summary = paymentService.getSummary();

        assertEquals(BigDecimal.valueOf(175), summary.getTotalAmount());
        assertEquals(BigDecimal.valueOf(100), summary.getSuccessAmount());
        assertEquals(BigDecimal.valueOf(50), summary.getPendingAmount());
        assertEquals(BigDecimal.valueOf(25), summary.getFailedAmount());
    }
}
