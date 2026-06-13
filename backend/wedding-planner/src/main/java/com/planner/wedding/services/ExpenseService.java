package com.planner.wedding.services;

import com.planner.wedding.dto.CreateExpenseRequest;
import com.planner.wedding.dto.ExpenseResponse;
import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.Expense;
import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.User;
import com.planner.wedding.repositories.ExpenseRepository;
import com.planner.wedding.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TaskRepository taskRepository;
    private final EventService eventService;

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpenses(Long taskId, Long eventId, User user) {
        List<Expense> expenses;
        if (user != null) {
            if (taskId != null) {
                Task task = taskRepository.findById(taskId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
                eventService.requireOwnedEvent(task.getEvent().getId(), user);
                expenses = expenseRepository.findByTaskId(taskId);
            } else if (eventId != null) {
                eventService.requireOwnedEvent(eventId, user);
                List<Task> tasks = taskRepository.findByEventId(eventId);
                List<Long> taskIds = tasks.stream().map(Task::getId).toList();
                expenses = taskIds.isEmpty() ? List.of() : taskIds.stream()
                        .flatMap(id -> expenseRepository.findByTaskId(id).stream())
                        .toList();
            } else {
                List<Long> eventIds = eventService.findAll(user).stream().map(Event::getId).toList();
                List<Long> taskIds = eventIds.isEmpty() ? List.of() : eventIds.stream()
                        .flatMap(id -> taskRepository.findByEventId(id).stream())
                        .map(Task::getId)
                        .toList();
                expenses = taskIds.isEmpty() ? List.of() : taskIds.stream()
                        .flatMap(id -> expenseRepository.findByTaskId(id).stream())
                        .toList();
            }
        } else {
            // permitAll / unauthenticated local testing
            if (taskId != null) {
                expenses = expenseRepository.findByTaskId(taskId);
            } else if (eventId != null) {
                List<Task> tasks = taskRepository.findByEventId(eventId);
                List<Long> taskIds = tasks.stream().map(Task::getId).toList();
                expenses = taskIds.isEmpty() ? List.of() : taskIds.stream()
                        .flatMap(id -> expenseRepository.findByTaskId(id).stream())
                        .toList();
            } else {
                expenses = expenseRepository.findAll();
            }
        }
        return expenses.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id, User user) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        if (user != null && expense.getTask() != null) {
            eventService.requireOwnedEvent(expense.getTask().getEvent().getId(), user);
        }
        return mapToResponse(expense);
    }

    public ExpenseResponse createExpense(CreateExpenseRequest request, User user) {
        if (request.getTaskId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task id is required");
        }
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        if (user != null) {
            eventService.requireOwnedEvent(task.getEvent().getId(), user);
        }

        Expense expense = Expense.builder()
                .task(task)
                .amount(request.getAmount())
                .description(request.getDescription())
                .category(request.getCategory())
                .date(request.getDate())
                .status(request.getStatus())
                .build();

        return mapToResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(Long id, CreateExpenseRequest request, User user) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        if (user != null && expense.getTask() != null) {
            eventService.requireOwnedEvent(expense.getTask().getEvent().getId(), user);
        }

        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
            if (user != null) {
                eventService.requireOwnedEvent(task.getEvent().getId(), user);
            }
            expense.setTask(task);
        }
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());
        expense.setStatus(request.getStatus());

        return mapToResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long id, User user) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
        if (user != null && expense.getTask() != null) {
            eventService.requireOwnedEvent(expense.getTask().getEvent().getId(), user);
        }
        expenseRepository.delete(expense);
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .taskId(expense.getTask() != null ? expense.getTask().getId() : null)
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .category(expense.getCategory())
                .date(expense.getDate())
                .status(expense.getStatus())
                .paymentId(expense.getPayment() != null ? expense.getPayment().getId() : null)
                .build();
    }
}
