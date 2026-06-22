package com.planner.wedding.controllers;

import com.planner.wedding.dto.*;
import com.planner.wedding.entities.PaymentStatus;
import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import com.planner.wedding.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestBody CreatePaymentRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user != null && user.getRole() != UserRole.PLANNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only wedding planner can create payments");
        }
        PaymentResponse payment = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getPayments(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) Long eventId
    ) {
        List<PaymentResponse> payments = paymentService.getPayments(status, vendorId, eventId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        PaymentResponse payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{id}/confirm-online")
    public ResponseEntity<PaymentResponse> confirmOnlinePayment(
            @PathVariable Long id,
            @RequestBody ConfirmOnlinePaymentRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user != null && user.getRole() == UserRole.PLANNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Wedding planner cannot pay online");
        }
        PaymentResponse payment = paymentService.confirmOnlinePayment(id, request);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<PaymentResponse> cancelPayment(
            @PathVariable Long id,
            @RequestBody(required = false) CancelPaymentRequest request
    ) {
        PaymentResponse payment = paymentService.cancelPayment(id, request);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<PaymentResponse> retryPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        if (user != null && user.getRole() == UserRole.PLANNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Wedding planner cannot retry payments");
        }
        PaymentResponse payment = paymentService.retryPayment(id);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{id}/offline-approve")
    public ResponseEntity<PaymentResponse> approveOfflinePayment(
            @PathVariable Long id,
            @RequestBody(required = false) OfflineApprovePaymentRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user != null && user.getRole() != UserRole.PLANNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only wedding planner can approve offline payments");
        }
        PaymentResponse payment = paymentService.approveOfflinePayment(id, request);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/summary")
    public ResponseEntity<PaymentSummaryResponse> getSummary(
            @RequestParam(required = false) Long eventId
    ) {
        PaymentSummaryResponse summary = eventId != null
                ? paymentService.getSummary(eventId)
                : paymentService.getSummary();
        return ResponseEntity.ok(summary);
    }
}
