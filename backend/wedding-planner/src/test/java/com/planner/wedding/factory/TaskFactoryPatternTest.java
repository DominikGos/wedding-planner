package com.planner.wedding.factory;

import com.planner.wedding.dto.CreateTaskDTO;
import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.TaskType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class TaskFactoryPatternTest {

    @Test
    void shouldReturnCorrectFactoryInstance() {
        TaskFactory cateringFactory = TaskFactory.getFactory(TaskType.CATERING);
        TaskFactory decorationFactory = TaskFactory.getFactory(TaskType.DECORATION);
        TaskFactory entertainmentFactory = TaskFactory.getFactory(TaskType.ENTERTAINMENT);

        assertNotNull(cateringFactory);
        assertTrue(cateringFactory instanceof CateringTaskFactory);

        assertNotNull(decorationFactory);
        assertTrue(decorationFactory instanceof DecorationTaskFactory);

        assertNotNull(entertainmentFactory);
        assertTrue(entertainmentFactory instanceof EntertainmentTaskFactory);
    }

    @Test
    void shouldThrowExceptionForUnknownOrNullType() {
        assertThrows(NullPointerException.class, () -> {
            TaskFactory.getFactory(null);
        });
    }

    @Test
    void cateringFactoryShouldCreateValidateAndConvertTask() {
        TaskFactory factory = TaskFactory.getFactory(TaskType.CATERING);
        LocalDateTime now = LocalDateTime.now();

        CreateTaskDTO dto = CreateTaskDTO.builder()
                .type(TaskType.CATERING)
                .name("Wedding Catering Menu")
                .description("Catering service description")
                .dueDate(now)
                .priority(3)
                .pricePerGuest(BigDecimal.valueOf(120.50))
                .numberOfGuests(150)
                .mealType("VEGAN")
                .build();

        // 1. Create and verify fields
        Task task = factory.createFromDTO(dto);
        assertNotNull(task);
        assertEquals(TaskType.CATERING, task.getType());
        assertEquals("Wedding Catering Menu", task.getName());
        assertEquals("PENDING", task.getStatus());
        assertEquals(3, task.getPriority());
        assertEquals(BigDecimal.valueOf(120.50), task.getPricePerGuest());
        assertEquals(150, task.getNumberOfGuests());
        assertEquals("VEGAN", task.getMealType());

        // 2. Convert and verify
        Map<String, Object> map = factory.convertToDTO(task);
        assertNotNull(map);
        assertEquals(TaskType.CATERING, map.get("type"));
        assertEquals("Wedding Catering Menu", map.get("name"));
        assertEquals(BigDecimal.valueOf(120.50), map.get("pricePerGuest"));
        assertEquals(150, map.get("numberOfGuests"));

        // 3. Validation failure tests
        CreateTaskDTO invalidName = CreateTaskDTO.builder().name(null).build();
        assertThrows(IllegalArgumentException.class, () -> factory.validateDTO(invalidName));

        CreateTaskDTO negativePrice = CreateTaskDTO.builder()
                .name("Valid Name")
                .pricePerGuest(BigDecimal.valueOf(-10))
                .build();
        assertThrows(IllegalArgumentException.class, () -> factory.validateDTO(negativePrice));

        CreateTaskDTO negativeGuests = CreateTaskDTO.builder()
                .name("Valid Name")
                .numberOfGuests(-5)
                .build();
        assertThrows(IllegalArgumentException.class, () -> factory.validateDTO(negativeGuests));
    }

    @Test
    void decorationFactoryShouldCreateValidateAndConvertTask() {
        TaskFactory factory = TaskFactory.getFactory(TaskType.DECORATION);

        CreateTaskDTO dto = CreateTaskDTO.builder()
                .type(TaskType.DECORATION)
                .name("Hall Decorating")
                .theme("Rustic")
                .totalPrice(BigDecimal.valueOf(3000))
                .build();

        Task task = factory.createFromDTO(dto);
        assertNotNull(task);
        assertEquals(TaskType.DECORATION, task.getType());
        assertEquals("Rustic", task.getTheme());
        assertEquals(BigDecimal.valueOf(3000), task.getTotalPrice());

        Map<String, Object> map = factory.convertToDTO(task);
        assertEquals("Rustic", map.get("theme"));
        assertEquals(BigDecimal.valueOf(3000), map.get("totalPrice"));

        CreateTaskDTO negativePrice = CreateTaskDTO.builder()
                .name("Decor")
                .totalPrice(BigDecimal.valueOf(-500))
                .build();
        assertThrows(IllegalArgumentException.class, () -> factory.validateDTO(negativePrice));
    }

    @Test
    void entertainmentFactoryShouldCreateValidateAndConvertTask() {
        TaskFactory factory = TaskFactory.getFactory(TaskType.ENTERTAINMENT);

        CreateTaskDTO dto = CreateTaskDTO.builder()
                .type(TaskType.ENTERTAINMENT)
                .name("Live Band Performance")
                .performerName("The Rockin' Strings")
                .duration(180)
                .totalPrice(BigDecimal.valueOf(4500))
                .build();

        Task task = factory.createFromDTO(dto);
        assertNotNull(task);
        assertEquals(TaskType.ENTERTAINMENT, task.getType());
        assertEquals("The Rockin' Strings", task.getPerformerName());
        assertEquals(180, task.getDuration());
        assertEquals(BigDecimal.valueOf(4500), task.getTotalPrice());

        Map<String, Object> map = factory.convertToDTO(task);
        assertEquals("The Rockin' Strings", map.get("performerName"));
        assertEquals(180, map.get("duration"));
        assertEquals(BigDecimal.valueOf(4500), map.get("totalPrice"));

        CreateTaskDTO negativeDuration = CreateTaskDTO.builder()
                .name("DJ")
                .duration(-60)
                .build();
        assertThrows(IllegalArgumentException.class, () -> factory.validateDTO(negativeDuration));
    }
}
