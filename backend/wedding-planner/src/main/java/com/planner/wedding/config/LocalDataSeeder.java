package com.planner.wedding.config;

import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.Expense;
import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.TaskType;
import com.planner.wedding.entities.Vendor;
import com.planner.wedding.repositories.EventRepository;
import com.planner.wedding.repositories.ExpenseRepository;
import com.planner.wedding.repositories.TaskRepository;
import com.planner.wedding.repositories.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@Profile("local")
@RequiredArgsConstructor
public class LocalDataSeeder implements CommandLineRunner {

    private static final Logger log =
            LoggerFactory.getLogger(LocalDataSeeder.class);

    private static final String EVENT_NAME =
            "Local Payment Test Event";

    private static final String VENDOR_NAME =
            "Local Payment Test Vendor";

    private static final String TASK_NAME =
            "Local Payment Test Task";

    private static final String ONLINE_SUCCESS_EXPENSE_DESCRIPTION =
            "Local payment online success expense";

    private static final String ONLINE_FAILED_EXPENSE_DESCRIPTION =
            "Local payment online failed expense";

    private static final String OFFLINE_EXPENSE_DESCRIPTION =
            "Local payment offline expense";

    private final EventRepository eventRepository;
    private final VendorRepository vendorRepository;
    private final TaskRepository taskRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    @Transactional
    public void run(String... args) {
        Event event = findOrCreateEvent();
        Vendor vendor = findOrCreateVendor();
        Task task = findOrCreateTask(event, vendor);
        Expense onlineSuccessExpense = findOrCreateExpense(
                task,
                ONLINE_SUCCESS_EXPENSE_DESCRIPTION,
                new BigDecimal("1500.00")
        );
        Expense onlineFailedExpense = findOrCreateExpense(
                task,
                ONLINE_FAILED_EXPENSE_DESCRIPTION,
                new BigDecimal("1600.00")
        );
        Expense offlineExpense = findOrCreateExpense(
                task,
                OFFLINE_EXPENSE_DESCRIPTION,
                new BigDecimal("1700.00")
        );

        log.info(
                "Local seed ready. Vendor id: {}, Online success expense id: {}, Online failed expense id: {}, Offline expense id: {}, Task id: {}, Event id: {}",
                vendor.getId(),
                onlineSuccessExpense.getId(),
                onlineFailedExpense.getId(),
                offlineExpense.getId(),
                task.getId(),
                event.getId()
        );
    }

    private Event findOrCreateEvent() {
        return eventRepository.findAll().stream()
                .filter(event -> EVENT_NAME.equals(event.getName()))
                .findFirst()
                .orElseGet(() -> eventRepository.save(
                        Event.builder()
                                .name(EVENT_NAME)
                                .eventDate(LocalDateTime.now().plusMonths(6))
                                .location("Warsaw")
                                .status("PLANNED")
                                .build()
                ));
    }

    private Vendor findOrCreateVendor() {
        return vendorRepository.findAll().stream()
                .filter(vendor -> VENDOR_NAME.equals(vendor.getCompanyName()))
                .findFirst()
                .orElseGet(() -> vendorRepository.save(
                        Vendor.builder()
                                .companyName(VENDOR_NAME)
                                .serviceType("CATERING")
                                .contact("local-vendor@wedding.test")
                                .price(new BigDecimal("2500.00"))
                                .build()
                ));
    }

    private Task findOrCreateTask(Event event, Vendor vendor) {
        return taskRepository.findAll().stream()
                .filter(task -> TASK_NAME.equals(task.getName()))
                .findFirst()
                .orElseGet(() -> taskRepository.save(
                        Task.builder()
                                .event(event)
                                .vendor(vendor)
                                .type(TaskType.CATERING)
                                .name(TASK_NAME)
                                .description("Task for local payment testing")
                                .dueDate(LocalDateTime.now().plusMonths(5))
                                .status("PENDING")
                                .priority(1)
                                .pricePerGuest(new BigDecimal("120.00"))
                                .numberOfGuests(50)
                                .mealType("STANDARD")
                                .build()
                ));
    }

    private Expense findOrCreateExpense(Task task, String description, BigDecimal amount) {
        return expenseRepository.findAll().stream()
                .filter(expense -> description.equals(expense.getDescription()))
                .findFirst()
                .orElseGet(() -> expenseRepository.save(
                        Expense.builder()
                                .task(task)
                                .amount(amount)
                                .description(description)
                                .category("ADVANCE")
                                .date(LocalDateTime.now())
                                .status("PENDING")
                                .build()
                ));
    }
}
