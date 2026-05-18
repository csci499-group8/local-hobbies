package io.github.csci499_group8.local_hobbies.backend.security;

import io.github.csci499_group8.local_hobbies.backend.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final Duration accessDuration;
    private final Duration refreshDuration;

    public JwtService(
            @Value("${application.security.jwt.secret-key}") String secretKeyString,
            @Value("${application.security.jwt.access-duration}") Duration accessDuration,
            @Value("${application.security.jwt.refresh-duration}") Duration refreshDuration) {
        //convert Base64-encoded string to key
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKeyString));
        this.accessDuration = accessDuration;
        this.refreshDuration = refreshDuration;
    }

    public String generateAccessToken(UUID userId, boolean onboardingComplete) {
        Map<String, Object> extraClaims = Map.of("type", "ACCESS",
                                                 "onboardingComplete", onboardingComplete);
        return buildToken(userId, extraClaims, accessDuration);
    }

    public String generateRefreshToken(UUID userId, boolean onboardingComplete) {
        Map<String, Object> extraClaims = Map.of("type", "REFRESH",
                                                 "onboardingComplete", onboardingComplete);
        return buildToken(userId, extraClaims, refreshDuration);
    }

    public String buildToken(UUID userId, Map<String, Object> extraClaims, Duration duration) {
        Instant now = Instant.now();
        Instant expirationTime = now.plus(duration);

        return Jwts.builder()
                   .claims(extraClaims)
                   .subject(userId.toString())
                   .issuedAt(Date.from(now))
                   .expiration(Date.from(expirationTime))
                   .signWith(secretKey)
                   .compact();
    }

    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                       .verifyWith(secretKey)
                       .build()
                       .parseSignedClaims(token)
                       .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }

}
