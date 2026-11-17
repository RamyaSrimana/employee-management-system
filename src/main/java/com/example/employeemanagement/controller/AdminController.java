
package com.example.employeemanagement.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.example.employeemanagement.dto.AdminRequest;
import com.example.employeemanagement.dto.AuthResponse;
import com.example.employeemanagement.dto.UserResponse;
import com.example.employeemanagement.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse createAdmin(
            @Valid @RequestBody AdminRequest request) {

        return adminService.createAdmin(request);
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {

        return adminService.getAllUsers();
    }

    @PostMapping("/employee-accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse createEmployeeAccount(
            @Valid @RequestBody AdminRequest request) {

        return adminService.createEmployeeAccount(request);
    }
}
