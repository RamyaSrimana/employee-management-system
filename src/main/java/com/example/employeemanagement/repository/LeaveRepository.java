
package com.example.employeemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.employeemanagement.entity.LeaveApplication;

public interface LeaveRepository
        extends JpaRepository<LeaveApplication, Long> {

    List<LeaveApplication> findByEmployee_IdOrderByAppliedAtDesc(Long employeeId);

    List<LeaveApplication> findAllByOrderByAppliedAtDesc();
}
