package com.planner.wedding.repositories;

import com.planner.wedding.entities.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    List<Vendor> findByServiceType(String serviceType);

}