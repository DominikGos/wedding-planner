package com.planner.wedding.repositories;

import com.planner.wedding.entities.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByVendorId(Long vendorId);

    List<Payment> findByStatus(String status);

}