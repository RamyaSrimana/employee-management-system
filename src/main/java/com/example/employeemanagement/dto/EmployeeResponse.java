
package com.example.employeemanagement.dto;

public class EmployeeResponse {

    private Long id;
    private String name;
    private String email;
    private double salary;
    private Long departmentId;
    private String departmentName;

    public EmployeeResponse() {
    }

    public EmployeeResponse(Long id, String name, String email,
                            double salary, Long departmentId,
                            String departmentName) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.salary = salary;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public double getSalary() {
        return salary;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }
}
