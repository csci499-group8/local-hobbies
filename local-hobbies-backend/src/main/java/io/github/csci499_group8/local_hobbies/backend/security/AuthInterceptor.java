package io.github.csci499_group8.local_hobbies.backend.security;

import io.github.csci499_group8.local_hobbies.backend.exception.UnauthorizedException;
import io.github.csci499_group8.local_hobbies.backend.service.AuthService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final TokenService tokenService;
    private final AuthService authService;

    /**
     * Authenticate token and check if authenticated user still exists.
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid authorization header");
        }

        String token = authHeader.substring(7); //extract token string (i.e. remove "Bearer ")
        Claims claims = tokenService.parseToken(token);
        String userId = claims.getSubject();
        request.setAttribute("userId", userId); //store user ID as attribute in request

        authService.verifyUserExists(userId); //verify that authenticated user exists

        return true; //proceed to controller
    }

}
