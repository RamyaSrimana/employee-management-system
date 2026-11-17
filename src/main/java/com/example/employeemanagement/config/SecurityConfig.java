
package com.example.employeemanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.employeemanagement.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .formLogin(form -> form.disable())

            .httpBasic(basic -> basic.disable())

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                // Public endpoints
                .requestMatchers(
                    "/",
                    "/api/auth/register",
                    "/api/auth/login",
                    "/login.html",
                    "/login.css",
                    "/login.js",
                    "/admin-dashboard.html",
                    "/admin-dashboard.css",
                    "/admin-dashboard.js",
                    "/employee-dashboard.html",
                    "/employee-dashboard.css",
                    "/employee-dashboard.js"
                ).permitAll()

                // Employee APIs
                .requestMatchers(HttpMethod.GET, "/api/employees/me")
                    .hasRole("USER")

                .requestMatchers(HttpMethod.GET,
                    "/api/employees", "/api/employees/**")
                    .hasAnyRole("ADMIN", "USER")

                .requestMatchers(HttpMethod.POST,
                    "/api/employees", "/api/employees/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.PUT,
                    "/api/employees", "/api/employees/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE,
                    "/api/employees", "/api/employees/**")
                    .hasRole("ADMIN")

                // Department APIs
                .requestMatchers(HttpMethod.GET,
                    "/api/departments", "/api/departments/**")
                    .hasAnyRole("ADMIN", "USER")

                .requestMatchers(HttpMethod.POST,
                    "/api/departments", "/api/departments/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.PUT,
                    "/api/departments", "/api/departments/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE,
                    "/api/departments", "/api/departments/**")
                    .hasRole("ADMIN")

                // Admin APIs
                .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")

                // Leave APIs
                .requestMatchers(HttpMethod.POST, "/api/leaves")
                    .hasRole("USER")

                .requestMatchers(HttpMethod.GET, "/api/leaves/my")
                    .hasRole("USER")

                .requestMatchers(HttpMethod.GET, "/api/leaves")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.PUT, "/api/leaves/*/status")
                    .hasRole("ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
