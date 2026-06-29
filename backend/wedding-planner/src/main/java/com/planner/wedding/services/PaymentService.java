package com.planner.wedding.services;

import com.planner.wedding.dto.*;
import com.planner.wedding.entities.*;
import com.planner.wedding.repositories.ExpenseRepository;
import com.planner.wedding.repositories.PaymentRepository;
import com.planner.wedding.repositories.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final VendorRepository vendorRepository;
    private final PaymentGatewayClient paymentGatewayClient;

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    public PaymentResponse createPayment(CreatePaymentRequest request) {
        validateCreateRequest(request);

        Expense expense = expenseRepository.findById(request.getExpenseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));

        Payment payment = expense.getPayment();
        PaymentMethod paymentMethod = expense.getTask() != null
                && expense.getTask().getPaymentMethod() != null
                        ? expense.getTask().getPaymentMethod()
                        : null;
        if (paymentMethod == null
                && payment != null
                && payment.getStatus() == PaymentStatus.CANCELLED
                && payment.getMethod() != null) {
            paymentMethod = payment.getMethod();
        }
        if (paymentMethod == null) {
            paymentMethod = PaymentMethod.ONLINE;
        }

        if (payment != null && payment.getStatus() != PaymentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Expense already has a payment");
        }

        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found"));

        if (payment == null) {
            payment = new Payment();
        }
        payment.setExpense(expense);
        payment.setVendor(vendor);
        payment.setAmount(request.getAmount());
        payment.setMethod(paymentMethod);
        payment.setCurrency(resolveCurrency(request.getCurrency()));
        payment.setFailureReason(null);
        payment.setApprovedAt(null);
        payment.setApprovedBy(null);

        if (paymentMethod == PaymentMethod.ONLINE) {
            payment.setStatus(PaymentStatus.PENDING);
            payment.setGatewayPaymentId(
                    paymentGatewayClient.createSandboxPayment(
                            payment.getAmount(),
                            payment.getCurrency()));
        } else {
            payment.setStatus(PaymentStatus.OFFLINE);
            payment.setGatewayPaymentId(null);
        }

        return mapToResponse(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPayments(
            PaymentStatus status,
            Long vendorId,
            Long eventId) {
        List<Payment> payments;

        if (status != null) {
            payments = paymentRepository.findByStatus(status);
        } else if (vendorId != null) {
            payments = paymentRepository.findByVendorId(vendorId);
        } else if (eventId != null) {
            payments = paymentRepository.findByExpenseTaskEventId(eventId);
        } else {
            payments = paymentRepository.findAll();
        }

        return payments.stream()
                .filter(payment -> vendorId == null || payment.getVendor().getId().equals(vendorId))
                .filter(payment -> eventId == null || hasEventId(payment, eventId))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = findPayment(id);
        return mapToResponse(payment);
    }

    public PaymentResponse confirmOnlinePayment(Long id, ConfirmOnlinePaymentRequest request) {
        Payment payment = findPayment(id);

        if (payment.getMethod() != PaymentMethod.ONLINE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only online payments can be confirmed online");
        }

        if (payment.getStatus() != PaymentStatus.PENDING && payment.getStatus() != PaymentStatus.FAILED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending or failed online payments can be confirmed");
        }

        if (request.getGatewayPaymentId() != null
                && payment.getGatewayPaymentId() != null
                && !payment.getGatewayPaymentId().equals(request.getGatewayPaymentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gateway payment id does not match");
        }

        if (stripeSecretKey != null && !stripeSecretKey.isBlank() &&
                payment.getGatewayPaymentId() != null &&
                (payment.getGatewayPaymentId().startsWith("pi_")
                        || payment.getGatewayPaymentId().contains("_secret_"))) {

            try {
                String intentId = extractPaymentIntentId(payment.getGatewayPaymentId());
                com.stripe.model.PaymentIntent intent = com.stripe.model.PaymentIntent.retrieve(intentId);

                if ("succeeded".equals(intent.getStatus())) {
                    payment.setStatus(PaymentStatus.SUCCESS);
                    payment.setFailureReason(null);
                } else if ("canceled".equals(intent.getStatus())) {
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setFailureReason("Płatność została anulowana.");
                } else {
                    if (intent.getLastPaymentError() != null) {
                        // Jeśli w Stripe wystąpił błąd autoryzacji (np. zły BLIK, brak środków, odrzucenie banku),
                        // to natychmiast oznaczamy transakcję w bazie jako FAILED, aby użytkownik widział to w tabeli
                        // i mógł kliknąć przycisk "Ponów" (Retry).
                        payment.setStatus(PaymentStatus.FAILED);
                        payment.setFailureReason(intent.getLastPaymentError().getMessage());
                    } else if (!request.isSuccess()) {
                        // Jeśli frontend jawnie zgłosił błąd (np. powrót z fail test Przelewy24)
                        payment.setStatus(PaymentStatus.FAILED);
                        payment.setFailureReason(
                                request.getFailureReason() == null || request.getFailureReason().isBlank()
                                        ? "Płatność online nie powiodła się."
                                        : request.getFailureReason()
                        );
                    } else {
                        // Brak błędów autoryzacji w Stripe i brak zgłoszenia porażki z frontendu.
                        // Płatność jest wciąż aktywna i nie podjęto jeszcze prób (np. nowa sesja).
                        payment.setStatus(PaymentStatus.PENDING);
                        payment.setFailureReason(null);
                    }
                }
            } catch (com.stripe.exception.StripeException e) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Failed to verify payment status with Stripe: " + e.getMessage(),
                        e);
            }
        } else {
            if (request.isSuccess()) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setFailureReason(null);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason(
                        request.getFailureReason() == null || request.getFailureReason().isBlank()
                                ? "Sandbox payment failed"
                                : request.getFailureReason());
            }
        }

        return mapToResponse(paymentRepository.save(payment));
    }

    private String extractPaymentIntentId(String gatewayPaymentId) {
        if (gatewayPaymentId == null) {
            return null;
        }
        if (gatewayPaymentId.contains("_secret_")) {
            return gatewayPaymentId.split("_secret_")[0];
        }
        return gatewayPaymentId;
    }

    public PaymentResponse cancelPayment(Long id, CancelPaymentRequest request) {
        Payment payment = findPayment(id);

        if (payment.getStatus() != PaymentStatus.PENDING
                && payment.getStatus() != PaymentStatus.OFFLINE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only pending or offline payments can be cancelled");
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setFailureReason(request != null ? request.getReason() : null);

        return mapToResponse(paymentRepository.save(payment));
    }

    public PaymentResponse retryPayment(Long id) {
        Payment originalPayment = findPayment(id);

        if (originalPayment.getStatus() != PaymentStatus.FAILED
                && originalPayment.getStatus() != PaymentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only failed or cancelled payments can be retried");
        }

        if (originalPayment.getMethod() != PaymentMethod.ONLINE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only online payments can be retried");
        }

        originalPayment.setStatus(PaymentStatus.PENDING);
        originalPayment.setGatewayPaymentId(
                paymentGatewayClient.createSandboxPayment(
                        originalPayment.getAmount(),
                        originalPayment.getCurrency()));
        originalPayment.setFailureReason(null);
        originalPayment.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(paymentRepository.save(originalPayment));
    }

    public PaymentResponse approveOfflinePayment(Long id, OfflineApprovePaymentRequest request) {
        Payment payment = findPayment(id);

        if (payment.getMethod() != PaymentMethod.OFFLINE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only offline payments can be approved offline");
        }

        if (payment.getStatus() != PaymentStatus.OFFLINE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only offline payments awaiting approval can be approved");
        }

        payment.setStatus(PaymentStatus.OFFLINE_APPROVED);
        payment.setApprovedAt(LocalDateTime.now());
        payment.setApprovedBy(resolveApprovedBy(request));
        payment.setFailureReason(null);

        return mapToResponse(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public PaymentSummaryResponse getSummary() {
        return getSummary(null);
    }

    @Transactional(readOnly = true)
    public PaymentSummaryResponse getSummary(Long eventId) {
        List<Payment> payments = eventId != null
                ? paymentRepository.findByExpenseTaskEventId(eventId)
                : paymentRepository.findAll();

        PaymentSummaryResponse summary = new PaymentSummaryResponse();
        summary.setTotalAmount(sumByStatus(payments, null));
        summary.setPendingAmount(sumByStatus(payments, PaymentStatus.PENDING));
        summary.setSuccessAmount(sumByStatus(payments, PaymentStatus.SUCCESS));
        summary.setFailedAmount(sumByStatus(payments, PaymentStatus.FAILED));
        summary.setCancelledAmount(sumByStatus(payments, PaymentStatus.CANCELLED));
        summary.setOfflineAmount(sumByStatus(payments, PaymentStatus.OFFLINE));
        summary.setOfflineApprovedAmount(sumByStatus(payments, PaymentStatus.OFFLINE_APPROVED));

        return summary;
    }

    private void validateCreateRequest(CreatePaymentRequest request) {
        if (request.getExpenseId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expense id is required");
        }

        if (request.getVendorId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vendor id is required");
        }

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than 0");
        }

    }

    private Payment findPayment(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
    }

    private String resolveCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return "PLN";
        }

        return currency.toUpperCase();
    }

    private String resolveApprovedBy(OfflineApprovePaymentRequest request) {
        if (request == null || request.getApprovedBy() == null || request.getApprovedBy().isBlank()) {
            return "ADMIN";
        }

        return request.getApprovedBy();
    }

    private boolean hasEventId(Payment payment, Long eventId) {
        return payment.getExpense() != null
                && payment.getExpense().getTask() != null
                && payment.getExpense().getTask().getEvent() != null
                && payment.getExpense().getTask().getEvent().getId().equals(eventId);
    }

    private BigDecimal sumByStatus(List<Payment> payments, PaymentStatus status) {
        return payments.stream()
                .filter(payment -> status == null || payment.getStatus() == status)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setExpenseId(payment.getExpense() != null ? payment.getExpense().getId() : null);
        response.setVendorId(payment.getVendor() != null ? payment.getVendor().getId() : null);
        response.setTaskId(
                payment.getExpense() != null && payment.getExpense().getTask() != null
                        ? payment.getExpense().getTask().getId()
                        : null);
        response.setEventId(
                payment.getExpense() != null
                        && payment.getExpense().getTask() != null
                        && payment.getExpense().getTask().getEvent() != null
                                ? payment.getExpense().getTask().getEvent().getId()
                                : null);
        response.setStatus(payment.getStatus());
        response.setMethod(payment.getMethod());
        response.setAmount(payment.getAmount());
        response.setCurrency(payment.getCurrency());
        response.setGatewayPaymentId(payment.getGatewayPaymentId());
        response.setFailureReason(payment.getFailureReason());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        response.setApprovedAt(payment.getApprovedAt());
        response.setApprovedBy(payment.getApprovedBy());
        return response;
    }
}
