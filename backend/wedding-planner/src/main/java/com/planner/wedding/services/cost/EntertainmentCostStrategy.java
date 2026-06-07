package com.planner.wedding.services.cost;

import com.planner.wedding.entities.Task;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component("ENTERTAINMENT")
public class EntertainmentCostStrategy implements TaskCostStrategy {

    @Override
    public BigDecimal calculate(Task task) {
        return task.getTotalPrice() != null ? task.getTotalPrice() : BigDecimal.ZERO;
    }
}