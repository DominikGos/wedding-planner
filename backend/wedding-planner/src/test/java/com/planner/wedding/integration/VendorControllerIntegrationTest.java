package com.planner.wedding.integration;

import com.planner.wedding.entities.Vendor;
import com.planner.wedding.services.VendorService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class VendorControllerIntegrationTest extends BaseIntegrationTest {

    @MockitoBean
    private VendorService vendorService;

    @Test
    void getAllVendorsReturnsList() {
        var vendor = Vendor.builder().id(1L).companyName("Best Catering").build();
        when(vendorService.findAll()).thenReturn(List.of(vendor));

        webTestClient.get()
                .uri("/api/vendors")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].id").isEqualTo(1)
                .jsonPath("$[0].companyName").isEqualTo("Best Catering");
    }

    @Test
    void getVendorByIdReturnsVendor() {
        var vendor = Vendor.builder().id(1L).companyName("Best Catering").build();
        when(vendorService.findById(eq(1L))).thenReturn(vendor);

        webTestClient.get()
                .uri("/api/vendors/1")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.companyName").isEqualTo("Best Catering");
    }

    @Test
    void createVendorReturns201() {
        var input = Vendor.builder().companyName("New Vendor").serviceType("FLORIST").build();
        var output = Vendor.builder().id(1L).companyName("New Vendor").serviceType("FLORIST").build();
        when(vendorService.create(any(Vendor.class))).thenReturn(output);

        webTestClient.post()
                .uri("/api/vendors")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(input)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.companyName").isEqualTo("New Vendor");
    }

    @Test
    void updateVendorReturnsUpdated() {
        var input = Vendor.builder().companyName("Updated Vendor").build();
        var output = Vendor.builder().id(1L).companyName("Updated Vendor").build();
        when(vendorService.update(eq(1L), any(Vendor.class))).thenReturn(output);

        webTestClient.put()
                .uri("/api/vendors/1")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(input)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.companyName").isEqualTo("Updated Vendor");
    }

    @Test
    void deleteVendorReturns204() {
        webTestClient.delete()
                .uri("/api/vendors/1")
                .exchange()
                .expectStatus().isNoContent();

        verify(vendorService).delete(eq(1L));
    }
}
