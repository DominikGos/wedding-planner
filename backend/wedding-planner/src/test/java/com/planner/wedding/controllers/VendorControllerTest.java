package com.planner.wedding.controllers;

import tools.jackson.databind.ObjectMapper;
import com.planner.wedding.entities.Vendor;
import com.planner.wedding.services.VendorService;
import com.planner.wedding.services.JwtService;
import com.planner.wedding.repositories.UserRepository;
import com.planner.wedding.services.CustomOAuth2UserService;
import com.planner.wedding.config.OAuthSuccessHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = VendorController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        OAuth2ClientAutoConfiguration.class,
        OAuth2ClientWebSecurityAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
class VendorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private VendorService vendorService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private CustomOAuth2UserService customOAuth2UserService;

    @MockitoBean
    private OAuthSuccessHandler oAuthSuccessHandler;

    @Test
    void getAllVendorsReturnsList() throws Exception {
        Vendor vendor = Vendor.builder().id(1L).companyName("Catering Group").build();
        when(vendorService.findAll()).thenReturn(List.of(vendor));

        mockMvc.perform(get("/api/vendors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].companyName").value("Catering Group"));
    }

    @Test
    void getVendorByIdReturnsVendor() throws Exception {
        Vendor vendor = Vendor.builder().id(1L).companyName("Catering Group").build();
        when(vendorService.findById(eq(1L))).thenReturn(vendor);

        mockMvc.perform(get("/api/vendors/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.companyName").value("Catering Group"));
    }

    @Test
    void createVendorReturns201() throws Exception {
        Vendor input = Vendor.builder().companyName("New Vendor").build();
        Vendor saved = Vendor.builder().id(10L).companyName("New Vendor").build();
        when(vendorService.create(any(Vendor.class))).thenReturn(saved);

        mockMvc.perform(post("/api/vendors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.companyName").value("New Vendor"));
    }

    @Test
    void updateVendorReturnsVendor() throws Exception {
        Vendor input = Vendor.builder().companyName("Updated Vendor").build();
        Vendor updated = Vendor.builder().id(1L).companyName("Updated Vendor").build();
        when(vendorService.update(eq(1L), any(Vendor.class))).thenReturn(updated);

        mockMvc.perform(put("/api/vendors/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.companyName").value("Updated Vendor"));
    }

    @Test
    void deleteVendorReturns204() throws Exception {
        mockMvc.perform(delete("/api/vendors/1"))
                .andExpect(status().isNoContent());

        verify(vendorService).delete(eq(1L));
    }
}
