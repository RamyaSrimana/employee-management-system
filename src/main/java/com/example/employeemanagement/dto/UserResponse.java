
package com.example.employeemanagement.dto;

public class UserResponse {

    private Long userId;
    private String email;
    private String role;
    private Long employeeId;
    private String employeeName;

    public UserResponse(Long userId, String email, String role,
                        Long employeeId, String employeeName) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
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

    public String getEmployeeName() {
        return employeeName;
    }
}
