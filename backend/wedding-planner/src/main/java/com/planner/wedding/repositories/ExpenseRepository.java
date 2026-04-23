package com.planner.wedding.repositories;

import com.planner.wedding.entities.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByTaskId(Long taskId);

    List<Expense> findByStatus(String status);

}