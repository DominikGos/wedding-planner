package com.planner.wedding.controllers;

import com.planner.wedding.dto.CreateExpenseRequest;
import com.planner.wedding.dto.ExpenseResponse;
import com.planner.wedding.entities.User;
import com.planner.wedding.services.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) Long eventId,
            @AuthenticationPrincipal User user
    ) {
        List<ExpenseResponse> expenses = expenseService.getExpenses(taskId, eventId, user);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        ExpenseResponse expense = expenseService.getExpenseById(id, user);
        return ResponseEntity.ok(expense);
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @RequestBody CreateExpenseRequest request,
            @AuthenticationPrincipal User user
    ) {
        ExpenseResponse created = expenseService.createExpense(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @RequestBody CreateExpenseRequest request,
            @AuthenticationPrincipal User user
    ) {
        ExpenseResponse updated = expenseService.updateExpense(id, request, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        expenseService.deleteExpense(id, user);
        return ResponseEntity.noContent().build();
    }
}
