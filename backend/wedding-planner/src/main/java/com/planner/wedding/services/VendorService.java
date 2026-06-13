package com.planner.wedding.services;

import com.planner.wedding.entities.Vendor;
import com.planner.wedding.repositories.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorService {

    private final VendorRepository vendorRepository;

    @Transactional(readOnly = true)
    public List<Vendor> findAll() {
        return vendorRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Vendor findById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found"));
    }

    public Vendor create(Vendor vendor) {
        vendor.setId(null);
        return vendorRepository.save(vendor);
    }

    public Vendor update(Long id, Vendor details) {
        Vendor vendor = findById(id);
        vendor.setCompanyName(details.getCompanyName());
        vendor.setServiceType(details.getServiceType());
        vendor.setContact(details.getContact());
        vendor.setPrice(details.getPrice());
        return vendorRepository.save(vendor);
    }

    public void delete(Long id) {
        Vendor vendor = findById(id);
        vendorRepository.delete(vendor);
    }
}
