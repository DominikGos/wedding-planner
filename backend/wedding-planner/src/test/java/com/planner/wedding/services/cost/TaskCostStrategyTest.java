package com.planner.wedding.services.cost;

import com.planner.wedding.entities.Task;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TaskCostStrategyTest {

    @Test
    void cateringCalculatesPricePerGuestTimesNumberOfGuests() {
        Task task = Task.builder()
                .pricePerGuest(new BigDecimal("120.00"))
                .numberOfGuests(50)
                .build();

        BigDecimal cost = new CateringCostStrategy().calculate(task);

        assertEquals(new BigDecimal("6000.00"), cost);
    }

    @Test
    void cateringReturnsZeroWhenRequiredDataIsMissing() {
        Task task = Task.builder()
                .pricePerGuest(new BigDecimal("120.00"))
                .build();

        BigDecimal cost = new CateringCostStrategy().calculate(task);

        assertEquals(BigDecimal.ZERO, cost);
    }

    @Test
    void decorationReturnsTotalPrice() {
        Task task = Task.builder()
                .totalPrice(new BigDecimal("2300.00"))
                .build();

        BigDecimal cost = new DecorationCostStrategy().calculate(task);

        assertEquals(new BigDecimal("2300.00"), cost);
    }

    @Test
    void decorationReturnsZeroWhenTotalPriceIsMissing() {
        BigDecimal cost = new DecorationCostStrategy().calculate(new Task());

        assertEquals(BigDecimal.ZERO, cost);
    }

    @Test
    void entertainmentReturnsTotalPrice() {
        Task task = Task.builder()
                .totalPrice(new BigDecimal("4000.00"))
                .build();

        BigDecimal cost = new EntertainmentCostStrategy().calculate(task);

        assertEquals(new BigDecimal("4000.00"), cost);
    }

    @Test
    void entertainmentReturnsZeroWhenTotalPriceIsMissing() {
        BigDecimal cost = new EntertainmentCostStrategy().calculate(new Task());

        assertEquals(BigDecimal.ZERO, cost);
    }
}
