package io.github.csci499_group8.local_hobbies.backend.security;

import io.github.csci499_group8.local_hobbies.backend.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final TokenService tokenService;

    @Autowired
    public AuthInterceptor(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid authorization header");
        }


        String token = authHeader.substring(7); //extract token string (i.e. remove "Bearer ")
        Claims claims = tokenService.parseToken(token);
        request.setAttribute("userId", claims.getSubject()); //store user ID as attribute in request

        return true; //proceed to controller
    }

}
