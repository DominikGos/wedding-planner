package com.planner.wedding.services.cost;

import com.planner.wedding.entities.Task;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component("CATERING")
public class CateringCostStrategy implements TaskCostStrategy {

    @Override
    public BigDecimal calculate(Task task) {
        if (task.getPricePerGuest() == null || task.getNumberOfGuests() == null) {
            return BigDecimal.ZERO;
        }
        return task.getPricePerGuest().multiply(BigDecimal.valueOf(task.getNumberOfGuests()));
    }
}