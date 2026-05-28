package com.planner.wedding.services;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class MockSandboxPaymentGatewayClient implements PaymentGatewayClient {

    @Override
    public String createSandboxPayment(BigDecimal amount, String currency) {
        return "SANDBOX-" + currency + "-" + UUID.randomUUID();
    }
}
