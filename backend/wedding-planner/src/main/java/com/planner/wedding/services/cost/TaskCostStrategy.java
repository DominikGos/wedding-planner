package com.planner.wedding.services.cost;

import com.planner.wedding.entities.Task;

import java.math.BigDecimal;

public interface TaskCostStrategy {

    BigDecimal calculate(Task task);
}