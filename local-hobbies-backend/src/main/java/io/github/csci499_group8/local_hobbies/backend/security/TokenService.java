package io.github.csci499_group8.local_hobbies.backend.security;

import io.github.csci499_group8.local_hobbies.backend.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class TokenService {

    //TODO: move SECRET_KEY value to environment variable
    private final String SECRET_KEY = "256-bit-secret-key-string";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    public String generateToken(String userId) {
        long oneDayInMs = 1000 * 60 * 60 * 24;
        Date now = new Date();
        Date expirationTime = new Date(now.getTime() + oneDayInMs); //expires in one day

        return Jwts.builder()
                   .subject(userId)
                   .issuedAt(now)
                   .expiration(expirationTime)
                   .signWith(key)
                   .compact();
    }

    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                       .verifyWith(key)
                       .build()
                       .parseSignedClaims(token)
                       .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }

}
