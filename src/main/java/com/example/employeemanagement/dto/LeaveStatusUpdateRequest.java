
package com.example.employeemanagement.dto;

import com.example.employeemanagement.entity.LeaveStatus;

import jakarta.validation.constraints.NotNull;

public class LeaveStatusUpdateRequest {

    @NotNull
    private LeaveStatus status;

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }
}
