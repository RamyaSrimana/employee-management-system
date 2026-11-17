
package com.example.employeemanagement.dto;

public class AuthResponse {

    private Long userId;
    private String email;
    private String role;
    private Long employeeId;
    private String token;
    private String message;

    public AuthResponse(Long userId, String email, String role,
                        Long employeeId, String token, String message) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.employeeId = employeeId;
        this.token = token;
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getToken() {
        return token;
    }

    public String getMessage() {
        return message;
    }
}
