package com.planner.wedding.controllers;

import tools.jackson.databind.ObjectMapper;
import com.planner.wedding.entities.Guest;
import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import com.planner.wedding.services.GuestService;
import com.planner.wedding.services.JwtService;
import com.planner.wedding.repositories.UserRepository;
import com.planner.wedding.services.CustomOAuth2UserService;
import com.planner.wedding.config.OAuthSuccessHandler;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = GuestController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        OAuth2ClientAutoConfiguration.class,
        OAuth2ClientWebSecurityAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@Import(GuestControllerTest.TestConfig.class)
class GuestControllerTest {

    @TestConfiguration
    static class TestConfig implements org.springframework.web.servlet.config.annotation.WebMvcConfigurer {
        @Override
        public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
            resolvers.add(new HandlerMethodArgumentResolver() {
                @Override
                public boolean supportsParameter(MethodParameter parameter) {
                    return parameter.getParameterType().equals(User.class)
                            && parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
                }

                @Override
                public Object resolveArgument(MethodParameter parameter,
                                               ModelAndViewContainer mavContainer,
                                               NativeWebRequest webRequest,
                                               WebDataBinderFactory binderFactory) {
                    return User.builder()
                            .id(7L)
                            .email("test@example.com")
                            .role(UserRole.PLANNER)
                            .build();
                }
            });
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private GuestService guestService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private CustomOAuth2UserService customOAuth2UserService;

    @MockitoBean
    private OAuthSuccessHandler oAuthSuccessHandler;

    @Test
    void getGuestsReturnsList() throws Exception {
        Guest guest = Guest.builder().id(1L).firstName("John").lastName("Doe").build();
        when(guestService.findByEventId(eq(10L), any(User.class))).thenReturn(List.of(guest));

        mockMvc.perform(get("/api/events/10/guests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].firstName").value("John"))
                .andExpect(jsonPath("$[0].lastName").value("Doe"));
    }

    @Test
    void getGuestByIdReturnsGuest() throws Exception {
        Guest guest = Guest.builder().id(1L).firstName("John").build();
        when(guestService.findById(eq(10L), eq(1L), any(User.class))).thenReturn(guest);

        mockMvc.perform(get("/api/events/10/guests/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void createGuestReturns201() throws Exception {
        Guest input = Guest.builder().firstName("John").build();
        Guest saved = Guest.builder().id(1L).firstName("John").build();

        when(guestService.create(eq(10L), any(Guest.class), any(User.class))).thenReturn(saved);

        mockMvc.perform(post("/api/events/10/guests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void updateGuestReturns200() throws Exception {
        Guest input = Guest.builder().firstName("John").build();
        Guest updated = Guest.builder().id(1L).firstName("John").build();

        when(guestService.update(eq(10L), eq(1L), any(Guest.class), any(User.class))).thenReturn(updated);

        mockMvc.perform(put("/api/events/10/guests/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void deleteGuestReturns204() throws Exception {
        mockMvc.perform(delete("/api/events/10/guests/1"))
                .andExpect(status().isNoContent());

        verify(guestService).delete(eq(10L), eq(1L), any(User.class));
    }
}
