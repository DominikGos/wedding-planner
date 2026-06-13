package com.planner.wedding.factory;

import com.planner.wedding.dto.CreateTaskDTO;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TaskFactoryValidationTest {

    @Test
    void categoryDetailsAreOptional() {
        CreateTaskDTO task = CreateTaskDTO.builder().name("Simple task").build();

        assertDoesNotThrow(() -> new CateringTaskFactory().validateDTO(task));
        assertDoesNotThrow(() -> new DecorationTaskFactory().validateDTO(task));
        assertDoesNotThrow(() -> new EntertainmentTaskFactory().validateDTO(task));
    }

    @Test
    void negativeCostsAndGuestCountAreRejected() {
        assertThrows(IllegalArgumentException.class, () -> new CateringTaskFactory().validateDTO(
                CreateTaskDTO.builder().name("Catering").pricePerGuest(new BigDecimal("-1")).build()
        ));
        assertThrows(IllegalArgumentException.class, () -> new CateringTaskFactory().validateDTO(
                CreateTaskDTO.builder().name("Catering").numberOfGuests(-1).build()
        ));
        assertThrows(IllegalArgumentException.class, () -> new DecorationTaskFactory().validateDTO(
                CreateTaskDTO.builder().name("Decorations").totalPrice(new BigDecimal("-1")).build()
        ));
        assertThrows(IllegalArgumentException.class, () -> new EntertainmentTaskFactory().validateDTO(
                CreateTaskDTO.builder().name("Entertainment").totalPrice(new BigDecimal("-1")).build()
        ));
    }
}
