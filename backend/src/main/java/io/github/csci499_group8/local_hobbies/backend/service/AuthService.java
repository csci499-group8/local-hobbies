package io.github.csci499_group8.local_hobbies.backend.service;

import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthLoginRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthRefreshRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthSignupRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.user.UserOnboardingRequest;
import io.github.csci499_group8.local_hobbies.backend.exception.ResourceNotFoundException;
import io.github.csci499_group8.local_hobbies.backend.exception.UnauthorizedException;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import io.github.csci499_group8.local_hobbies.backend.security.JwtService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserService userService;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        try {
            User user = userService.getUserByIdOrThrow(UUID.fromString(userId));

            return org.springframework.security.core.userdetails.User
                .withUsername(userId)
                .password(user.getPassword())
                .authorities("ROLE_USER")
                .build();

        } catch (ResourceNotFoundException | NumberFormatException e) {
            throw new UsernameNotFoundException("User not found with ID: " + userId);
        }
    }

    public AuthResponse signup(AuthSignupRequest signupRequest) {
        User newUser = userService.createUser(signupRequest);

        return generateAuthResponse(newUser);
    }

    public AuthResponse login(AuthLoginRequest loginRequest) {
        User user = userService.findUserByUsername(loginRequest.username())
                .filter(u -> passwordEncoder.matches(loginRequest.password(), u.getPassword()))
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        userService.updateLastSessionTime(user);

        return generateAuthResponse(user);
    }

    //TODO: store valid refresh tokens in database table; replace with new refresh token on refresh
    public AuthResponse refreshSession(AuthRefreshRequest refreshRequest) {
        Claims claims = jwtService.parseToken(refreshRequest.refreshToken());

        if (!"REFRESH".equals(claims.get("type"))) {
            throw new UnauthorizedException("Invalid token type");
        }

        User user = userService.getUserByIdOrThrow(UUID.fromString(claims.getSubject()));

        userService.updateLastSessionTime(user);

        return generateAuthResponse(user);
    }

    public AuthResponse completeOnboarding(UUID userId, UserOnboardingRequest request) {
        User user = userService.processOnboarding(userId, request);

        return generateAuthResponse(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.isOnboardingComplete());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.isOnboardingComplete());

        Claims claims = jwtService.parseToken(accessToken);
        OffsetDateTime expirationTime = claims.getExpiration().toInstant().atOffset(ZoneOffset.UTC);

        AuthResponse.Auth auth = new AuthResponse.Auth(accessToken,
                                                       "Bearer ",
                                                       expirationTime,
                                                       refreshToken);
        AuthResponse.User authUser = new AuthResponse.User(user.getId(),
                                                           user.isOnboardingComplete());

        return new AuthResponse(auth, authUser);
    }

}
