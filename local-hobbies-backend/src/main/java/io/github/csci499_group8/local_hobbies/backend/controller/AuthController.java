package io.github.csci499_group8.local_hobbies.backend.controller;

import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthLoginRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthSignupRequest;
import io.github.csci499_group8.local_hobbies.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody AuthSignupRequest signupRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(signupRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthLoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }
}
