package com.planner.wedding.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripePaymentGatewayClientTest {

    @Mock
    private MockSandboxPaymentGatewayClient mockClient;

    private StripePaymentGatewayClient stripeClient;

    @BeforeEach
    void setUp() {
        stripeClient = new StripePaymentGatewayClient(mockClient, "");
    }

    @Test
    void testFallbackToMockWhenKeyIsEmpty() {
        BigDecimal amount = BigDecimal.valueOf(150.00);
        String currency = "PLN";
        String expectedGatewayId = "SANDBOX-PLN-12345";

        when(mockClient.createSandboxPayment(amount, currency)).thenReturn(expectedGatewayId);

        String result = stripeClient.createSandboxPayment(amount, currency);

        assertEquals(expectedGatewayId, result);
        verify(mockClient).createSandboxPayment(amount, currency);
    }
}
