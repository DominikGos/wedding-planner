package com.planner.wedding.services;

import com.planner.wedding.entities.Vendor;
import com.planner.wedding.repositories.VendorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendorServiceTest {

    @Mock
    private VendorRepository vendorRepository;

    @InjectMocks
    private VendorService vendorService;

    @Test
    void findAllReturnsAllVendors() {
        Vendor vendor = Vendor.builder().id(1L).companyName("Wedding Flowers").build();
        when(vendorRepository.findAll()).thenReturn(List.of(vendor));

        List<Vendor> result = vendorService.findAll();

        assertEquals(1, result.size());
        assertSame(vendor, result.get(0));
        verify(vendorRepository).findAll();
    }

    @Test
    void findByIdReturnsVendorWhenExists() {
        Vendor vendor = Vendor.builder().id(1L).companyName("Wedding Flowers").build();
        when(vendorRepository.findById(1L)).thenReturn(Optional.of(vendor));

        Vendor result = vendorService.findById(1L);

        assertSame(vendor, result);
        verify(vendorRepository).findById(1L);
    }

    @Test
    void findByIdThrowsNotFoundExceptionWhenDoesNotExist() {
        when(vendorRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            vendorService.findById(999L);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Vendor not found", exception.getReason());
    }

    @Test
    void createSetsIdToNullAndSaves() {
        Vendor input = Vendor.builder().id(5L).companyName("Flowers").build();
        Vendor saved = Vendor.builder().id(10L).companyName("Flowers").build();

        when(vendorRepository.save(any(Vendor.class))).thenReturn(saved);

        Vendor result = vendorService.create(input);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        verify(vendorRepository).save(argThat(v -> v.getId() == null && "Flowers".equals(v.getCompanyName())));
    }

    @Test
    void updateModifiesPropertiesAndSaves() {
        Vendor existing = Vendor.builder()
                .id(1L)
                .companyName("Old Company")
                .serviceType("Catering")
                .contact("123")
                .price(BigDecimal.valueOf(100))
                .build();
        Vendor details = Vendor.builder()
                .companyName("New Company")
                .serviceType("Music")
                .contact("456")
                .price(BigDecimal.valueOf(200))
                .build();

        when(vendorRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(vendorRepository.save(any(Vendor.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Vendor result = vendorService.update(1L, details);

        assertEquals("New Company", result.getCompanyName());
        assertEquals("Music", result.getServiceType());
        assertEquals("456", result.getContact());
        assertEquals(0, BigDecimal.valueOf(200).compareTo(result.getPrice()));
        verify(vendorRepository).save(existing);
    }

    @Test
    void deleteRemovesVendorFromRepository() {
        Vendor existing = Vendor.builder().id(1L).companyName("Flowers").build();
        when(vendorRepository.findById(1L)).thenReturn(Optional.of(existing));

        vendorService.delete(1L);

        verify(vendorRepository).delete(existing);
    }
}
