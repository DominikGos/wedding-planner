package com.planner.wedding.repositories;

import com.planner.wedding.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByEventId(Long eventId);

    Optional<Task> findByIdAndEventId(Long id, Long eventId);

    List<Task> findByVendorId(Long vendorId);

    List<Task> findByStatus(String status);
}
