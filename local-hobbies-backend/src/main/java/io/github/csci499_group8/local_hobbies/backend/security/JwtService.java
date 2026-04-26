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
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${application.security.jwt.secret-key}") String secretKeyString,
            @Value("${application.security.jwt.expiration-ms}") long expirationMs) {
        //convert Base64-encoded string to key
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKeyString));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String userId, boolean onboardingComplete) {
        Date now = new Date();
        Date expirationTime = new Date(System.currentTimeMillis() + expirationMs);

        return Jwts.builder()
                   .claim("onboardingComplete", onboardingComplete)
                   .subject(userId)
                   .issuedAt(now)
                   .expiration(expirationTime)
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
