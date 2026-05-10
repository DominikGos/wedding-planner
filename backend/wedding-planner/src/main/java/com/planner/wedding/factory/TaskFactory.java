package com.planner.wedding.factory;

import com.planner.wedding.dto.CreateTaskDTO;
import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.TaskType;
import java.util.Map;

/**
 * Abstract Factory Pattern
 * Interfejs do tworzenia różnych typów tasków
 */
public abstract class TaskFactory {

    /**
     * Tworzy Task z DTO (konwersja)
     */
    public abstract Task createFromDTO(CreateTaskDTO dto);

    /**
     * Konwertuje Task na Map (elastyczne podejście)
     */
    public abstract Map<String, Object> convertToDTO(Task task);

    /**
     * Waliduje czy DTO ma wszystkie wymagane pola
     */
    public abstract void validateDTO(CreateTaskDTO dto);

    /**
     * Factory method - zwraca odpowiednią fabrykę na podstawie typu
     */
    public static TaskFactory getFactory(TaskType type) {
        return switch (type) {
            case CATERING -> new CateringTaskFactory();
            case DECORATION -> new DecorationTaskFactory();
            case ENTERTAINMENT -> new EntertainmentTaskFactory();
            default -> throw new IllegalArgumentException("Unknown task type: " + type);
        };
    }
}
