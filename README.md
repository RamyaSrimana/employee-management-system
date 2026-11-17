
# Employee Management System

## Project Overview
Employee Management System is a Java Full Stack web application developed using Spring Boot and MySQL.

The application helps administrators manage employees, departments, user accounts, and employee leave requests. Employees can view their profiles, apply for leave, and track leave status.

## Features

### Admin
- Admin login
- Add, view, update, and delete employees
- Create and manage departments
- View employees by department
- Create admin and employee login accounts
- View employee leave requests
- Approve or reject leave requests

### Employee
- Employee login
- View personal profile
- Apply for leave
- View leave history and status

## Technologies Used

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Hibernate
- Spring Security
- JWT Authentication
- BCrypt Password Encryption
- Maven

### Database
- MySQL

### Frontend
- HTML
- CSS
- JavaScript

### Tools
- Spring Tool Suite (STS)
- Postman
- Git and GitHub

## Project Architecture

Controller → Service → Repository → Database

The frontend communicates with the backend through REST APIs.

## Database Configuration

1. Create a MySQL database named `employee_management`.
2. Open `src/main/resources/application.properties.example`.
3. Configure your MySQL username, password, and JWT secret.
4. Create your local `application.properties` using those values.

## How to Run the Project

1. Clone or download this repository.
2. Open the project in Spring Tool Suite.
3. Configure the MySQL database.
4. Run the Spring Boot application.
5. Open the application in your browser.

## Author

Java Full Stack Developer
