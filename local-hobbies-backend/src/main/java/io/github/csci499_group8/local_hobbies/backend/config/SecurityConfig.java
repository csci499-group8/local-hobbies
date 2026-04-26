package io.github.csci499_group8.local_hobbies.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    //TODO: implement JWT filter instead of interceptor
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                                   session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); //TODO: remove
//            .authorizeHttpRequests(auth -> auth.requestMatchers(
//                    "/api/auth/login", //allow login
//                    "/api/auth/signup", //allow registration
//                    "/api/hobbies/global", //allow retrieval of global hobbies
//                    "/error") //allow error messages
//            .permitAll()
//            .anyRequest().authenticated()); //require authentication for everything else
        return http.build();
    }

}
