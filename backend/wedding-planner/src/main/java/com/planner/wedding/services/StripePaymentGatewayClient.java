package com.planner.wedding.services;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@Primary
public class StripePaymentGatewayClient implements PaymentGatewayClient {

    private final MockSandboxPaymentGatewayClient mockClient;
    private final String secretKey;

    public StripePaymentGatewayClient(
            MockSandboxPaymentGatewayClient mockClient,
            @Value("${stripe.secret.key:}") String secretKey
    ) {
        this.mockClient = mockClient;
        this.secretKey = secretKey;
        if (secretKey != null && !secretKey.isBlank()) {
            Stripe.apiKey = secretKey;
        }
    }

    @Override
    public String createSandboxPayment(BigDecimal amount, String currency) {
        if (secretKey == null || secretKey.isBlank()) {
            return mockClient.createSandboxPayment(amount, currency);
        }

        try {
            // Stripe amount is in cents
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency.toLowerCase())
                    .addAllPaymentMethodType(List.of("card", "blik", "p24"))
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            return intent.getClientSecret();
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create Stripe PaymentIntent: " + e.getMessage(), e);
        }
    }
}
