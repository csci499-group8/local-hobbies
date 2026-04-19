package io.github.csci499_group8.local_hobbies.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthLoginRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthSignupRequest;
import io.github.csci499_group8.local_hobbies.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;

@WebMvcTest(AuthController.class)
@RequiredArgsConstructor
class AuthControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    void signup_ShouldReturnCreated() throws Exception {
        AuthSignupRequest request = new AuthSignupRequest("testUser", "password123", "testUser@example.com");
        AuthResponse response = createMockAuthResponse(1, false);

        when(authService.signup(any(AuthSignupRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.user.id").value(1))
               .andExpect(jsonPath("$.user.onboardingComplete").value(false));
    }

    @Test
    void login_ShouldReturnOk() throws Exception {
        AuthLoginRequest request = new AuthLoginRequest("testUser", "password123");
        AuthResponse response = createMockAuthResponse(1, true);

        when(authService.login(any(AuthLoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.auth.token").value("mock-token"));
    }

    private AuthResponse createMockAuthResponse(Integer id, boolean onboarding) {
        return new AuthResponse(
                new AuthResponse.Auth("mock-token", "Bearer ", OffsetDateTime.now(), "refresh"),
                new AuthResponse.User(id, onboarding)
        );
    }
}
