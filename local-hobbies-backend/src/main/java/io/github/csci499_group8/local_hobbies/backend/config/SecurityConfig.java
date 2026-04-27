package io.github.csci499_group8.local_hobbies.backend.config;

import io.github.csci499_group8.local_hobbies.backend.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    @Qualifier("handlerExceptionResolver")
    private final HandlerExceptionResolver handlerExceptionResolver;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                                   session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/login", //allow login
                    "/api/auth/signup", //allow registration
                    "/api/hobbies/global", //allow retrieval of global hobbies
                    "/error") //allow error messages
                .permitAll()
                .anyRequest().authenticated()) //require authentication for everything else
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(exception -> exception
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    handlerExceptionResolver.resolveException(request, response, null, accessDeniedException))
                .authenticationEntryPoint((request, response, authException) ->
                    handlerExceptionResolver.resolveException(request, response, null, authException))
            );
        return http.build();
    }

}
