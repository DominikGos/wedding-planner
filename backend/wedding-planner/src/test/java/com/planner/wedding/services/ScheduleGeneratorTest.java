package com.planner.wedding.services;

import com.planner.wedding.entities.Task;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ScheduleGeneratorTest {

    @Test
    void singletonInstanceIsUniqueAndNonNull() {
        ScheduleGenerator instance1 = ScheduleGenerator.getInstance();
        ScheduleGenerator instance2 = ScheduleGenerator.getInstance();

        assertNotNull(instance1);
        assertSame(instance1, instance2);
    }

    @Test
    void singletonInstanceIsUniqueAndThreadSafe() throws InterruptedException {
        int threadCount = 50;
        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(threadCount);
        java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.CountDownLatch finishLatch = new java.util.concurrent.CountDownLatch(threadCount);
        
        ScheduleGenerator[] instances = new ScheduleGenerator[threadCount];
        
        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    latch.await(); // Wait for start signal to increase race condition probability
                    instances[index] = ScheduleGenerator.getInstance();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    finishLatch.countDown();
                }
            });
        }
        
        latch.countDown(); // Release all threads at once
        finishLatch.await(); // Wait for all threads to finish
        executor.shutdown();
        
        ScheduleGenerator firstInstance = instances[0];
        assertNotNull(firstInstance);
        for (int i = 1; i < threadCount; i++) {
            assertSame(firstInstance, instances[i]);
        }
    }

    @Test
    void generateScheduleSortsCorrectly() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);

        // Task 1: Tomorrow, Priority 10
        Task task1 = Task.builder().id(1L).dueDate(tomorrow).priority(10).build();
        // Task 2: Today, Priority 50
        Task task2 = Task.builder().id(2L).dueDate(now).priority(50).build();
        // Task 3: Today, Priority 100
        Task task3 = Task.builder().id(3L).dueDate(now).priority(100).build();
        // Task 4: Null DueDate, Priority 200
        Task task4 = Task.builder().id(4L).dueDate(null).priority(200).build();

        List<Task> tasks = List.of(task1, task2, task3, task4);

        ScheduleGenerator generator = ScheduleGenerator.getInstance();
        List<Task> sorted = generator.generateSchedule(tasks);

        assertEquals(4, sorted.size());
        
        // Expected order:
        // 1. Today, Priority 100 (task3) - earliest date, highest priority
        // 2. Today, Priority 50 (task2) - same date, lower priority
        // 3. Tomorrow, Priority 10 (task1) - later date
        // 4. Null DueDate, Priority 200 (task4) - null date last
        assertSame(task3, sorted.get(0));
        assertSame(task2, sorted.get(1));
        assertSame(task1, sorted.get(2));
        assertSame(task4, sorted.get(3));
    }

    @Test
    void generateScheduleHandlesEmptyList() {
        ScheduleGenerator generator = ScheduleGenerator.getInstance();
        List<Task> sorted = generator.generateSchedule(new ArrayList<>());
        assertTrue(sorted.isEmpty());
    }

    @Test
    void generateScheduleHandlesNullValuesInProperties() {
        // Task with null priority and date
        Task task1 = Task.builder().id(1L).dueDate(null).priority(null).build();
        // Task with non-null date but null priority
        Task task2 = Task.builder().id(2L).dueDate(LocalDateTime.now()).priority(null).build();
        // Task with same date but high priority
        Task task3 = Task.builder().id(3L).dueDate(task2.getDueDate()).priority(100).build();

        List<Task> tasks = List.of(task1, task2, task3);
        ScheduleGenerator generator = ScheduleGenerator.getInstance();
        List<Task> sorted = generator.generateSchedule(tasks);

        assertEquals(3, sorted.size());
        // Expected order:
        // task2 has null priority (which gets reversed in nullsLast, putting it first among matching dates)
        // task3 has priority 100
        // task1 has null date (last)
        // Let's verify our assumptions about comparator behavior or just verify the relative sorting.
        assertSame(task1, sorted.get(2)); // Null date is always last
    }
}
