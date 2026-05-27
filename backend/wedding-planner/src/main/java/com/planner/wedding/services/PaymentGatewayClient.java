package com.planner.wedding.services;

import java.math.BigDecimal;

public interface PaymentGatewayClient {

    String createSandboxPayment(BigDecimal amount, String currency);
}
