package com.planner.wedding.services;

import com.planner.wedding.entities.Task;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Singleton zrealizowany wzorcem Thread-Safe Double-Checked Locking.
 * Używany do generowania posortowanego harmonogramu zadań weselnych.
 */
public class ScheduleGenerator {

    private static volatile ScheduleGenerator instance;

    // Prywatny konstruktor blokuje możliwość stworzenia obiektu poza klasą
    private ScheduleGenerator() {
    }

    // Punkt dostępowy gwarantujący unikalność instancji i bezpieczeństwo wątkowe
    public static ScheduleGenerator getInstance() {
        if (instance == null) {
            synchronized (ScheduleGenerator.class) {
                if (instance == null) {
                    instance = new ScheduleGenerator();
                }
            }
        }
        return instance;
    }

    /**
     * Zwraca posortowaną listę zadań.
     * Sortowanie następuje po dacie (rosnąco, null na końcu)
     * a następnie po priorytecie (malejąco, 1 - najważniejsze np. 100).
     */
    public List<Task> generateSchedule(List<Task> tasks) {
        return tasks.stream()
                .sorted(Comparator.comparing(Task::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Comparator.comparing(Task::getPriority, Comparator.nullsLast(Comparator.naturalOrder())).reversed()))
                .collect(Collectors.toList());
    }
}
