
package com.example.employeemanagement.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.example.employeemanagement.dto.LeaveRequest;
import com.example.employeemanagement.dto.LeaveResponse;
import com.example.employeemanagement.dto.LeaveStatusUpdateRequest;
import com.example.employeemanagement.service.LeaveService;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // USER applies for leave
    @PostMapping
    public LeaveResponse applyLeave(
            @Valid @RequestBody LeaveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return leaveService.applyLeave(
                request, userDetails.getUsername());
    }

    // USER views own leaves
    @GetMapping("/my")
    public List<LeaveResponse> getMyLeaves(
            @AuthenticationPrincipal UserDetails userDetails) {

        return leaveService.getMyLeaves(
                userDetails.getUsername());
    }

    // ADMIN views all leaves
    @GetMapping
    public List<LeaveResponse> getAllLeaves() {

        return leaveService.getAllLeaves();
    }

    // ADMIN approves or rejects
    @PutMapping("/{id}/status")
    public LeaveResponse updateLeaveStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeaveStatusUpdateRequest request) {

        return leaveService.updateLeaveStatus(
                id, request.getStatus());
    }
}
