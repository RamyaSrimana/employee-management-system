
package com.example.employeemanagement.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.employeemanagement.dto.LeaveRequest;
import com.example.employeemanagement.dto.LeaveResponse;
import com.example.employeemanagement.entity.Employee;
import com.example.employeemanagement.entity.LeaveApplication;
import com.example.employeemanagement.entity.LeaveStatus;
import com.example.employeemanagement.entity.User;
import com.example.employeemanagement.repository.LeaveRepository;
import com.example.employeemanagement.repository.UserRepository;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;

    public LeaveService(
            LeaveRepository leaveRepository,
            UserRepository userRepository) {

        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
    }

    // Employee applies for leave
    public LeaveResponse applyLeave(LeaveRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Employee employee = user.getEmployee();

        if (employee == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No employee linked to this account");
        }

        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Leave date cannot be in the past");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End date cannot be before start date");
        }

        LeaveApplication leave = new LeaveApplication();

        leave.setEmployee(employee);
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());
        leave.setStatus(LeaveStatus.PENDING);
        leave.setAppliedAt(LocalDateTime.now());

        LeaveApplication saved = leaveRepository.save(leave);

        return toResponse(saved);
    }

    // Employee views only their own leaves
    public List<LeaveResponse> getMyLeaves(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Employee employee = user.getEmployee();

        if (employee == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No employee linked to this account");
        }

        return leaveRepository
                .findByEmployee_IdOrderByAppliedAtDesc(employee.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Admin views all leaves
    public List<LeaveResponse> getAllLeaves() {

        return leaveRepository.findAllByOrderByAppliedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Admin approves or rejects a leave
    public LeaveResponse updateLeaveStatus(
            Long id, LeaveStatus newStatus) {

        if (newStatus != LeaveStatus.APPROVED
                && newStatus != LeaveStatus.REJECTED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid leave status");
        }

        LeaveApplication leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Leave request not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Leave request already processed");
        }

        leave.setStatus(newStatus);

        return toResponse(leaveRepository.save(leave));
    }

    private LeaveResponse toResponse(LeaveApplication leave) {

        return new LeaveResponse(
                leave.getId(),
                leave.getEmployee().getId(),
                leave.getEmployee().getName(),
                leave.getStartDate(),
                leave.getEndDate(),
                leave.getReason(),
                leave.getStatus(),
                leave.getAppliedAt()
        );
    }
}
