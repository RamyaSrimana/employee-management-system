
// ======================================
// AUTHENTICATION CHECK
// ======================================

const token = sessionStorage.getItem("token");
const role = sessionStorage.getItem("role");

if (!token || role !== "ADMIN") {
    window.location.href = "/login.html";
}

const adminEmail = document.getElementById("adminEmail");

if (adminEmail) {
    adminEmail.textContent = sessionStorage.getItem("email") || "Admin";
}


// ======================================
// API URLS
// ======================================

const EMPLOYEE_URL = "/api/employees";
const DEPARTMENT_URL = "/api/departments";
const LEAVE_URL = "/api/leaves";
const ADMIN_URL = "/api/admin/users";
const EMPLOYEE_ACCOUNT_URL = "/api/admin/employee-accounts";


// ======================================
// COMMON API FUNCTIONS
// ======================================

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`
        }
    });

    const text = await response.text();

    let result = null;

    if (text) {
        try {
            result = JSON.parse(text);
        } catch {
            result = text;
        }
    }

    if (!response.ok) {
        const message =
            result?.message ||
            result?.detail ||
            result?.error ||
            (typeof result === "string" ? result : null) ||
            `Request failed: ${response.status}`;

        throw new Error(message);
    }

    return result;
}


function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


// ======================================
// DASHBOARD NAVIGATION
// ======================================

const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".page-section");

function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.toggle("active", section.id === sectionId);
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${sectionId}`
        );
    });

    if (sectionId === "dashboard") {
        loadDashboard();
    }

    if (sectionId === "employees") {
        loadEmployees();
        loadEmployeeDepartments();
    }

    if (sectionId === "leaves") {
        loadLeaveRequests();
    }

    if (sectionId === "users") {
        loadUsers();
    }

    if (sectionId === "departments") {
        loadDepartments();
    }
}


navLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const targetId = link.getAttribute("href").substring(1);

        showSection(targetId);
    });
});


// ======================================
// LOGOUT
// ======================================

document.getElementById("logoutButton").addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "/login.html";
});


// ======================================
// DASHBOARD COUNTS
// ======================================

async function loadDashboard() {
    try {
        const [employees, departments, leaves] = await Promise.all([
            apiRequest(EMPLOYEE_URL),
            apiRequest(DEPARTMENT_URL),
            apiRequest(LEAVE_URL)
        ]);

        document.getElementById("employeeCount").textContent =
            employees.length;

        document.getElementById("departmentCount").textContent =
            departments.length;

        document.getElementById("leaveCount").textContent =
            leaves.length;

        const pendingLeaves = leaves.filter(
            leave => leave.status === "PENDING"
        );

        document.getElementById("pendingCount").textContent =
            pendingLeaves.length;

    } catch (error) {
        console.error("Dashboard loading error:", error);
    }
}


// ======================================
// EMPLOYEE MANAGEMENT
// ======================================

const employeeFormCard = document.getElementById("employeeFormCard");
const employeeForm = document.getElementById("employeeForm");

const employeeId = document.getElementById("employeeId");
const employeeName = document.getElementById("employeeName");
const employeeEmail = document.getElementById("employeeEmail");
const employeeSalary = document.getElementById("employeeSalary");
const employeeDepartment = document.getElementById("employeeDepartment");

const employeeTableBody = document.getElementById("employeeTableBody");
const employeeSearch = document.getElementById("employeeSearch");

const employeeFormTitle = document.getElementById("employeeFormTitle");
const saveEmployeeButton = document.getElementById("saveEmployeeButton");

let allEmployees = [];
let allUsers = [];


// Show employee form

document.getElementById("showEmployeeForm").addEventListener("click", async () => {
    employeeForm.reset();

    employeeId.value = "";

    employeeFormTitle.textContent = "Add New Employee";
    saveEmployeeButton.textContent = "Save Employee";

    employeeFormCard.hidden = false;

    await loadEmployeeDepartments();
});


// Cancel employee form

document.getElementById("cancelEmployeeForm").addEventListener("click", () => {
    employeeForm.reset();

    employeeId.value = "";

    employeeFormCard.hidden = true;
});


// Load departments into employee dropdown

async function loadEmployeeDepartments() {
    try {
        const departments = await apiRequest(DEPARTMENT_URL);

        employeeDepartment.innerHTML =
            '<option value="">Select Department</option>';

        departments.forEach(department => {
            const option = document.createElement("option");

            option.value = department.id;
            option.textContent = department.name;

            employeeDepartment.appendChild(option);
        });

    } catch (error) {
        console.error("Department loading error:", error);
    }
}


// Load employees

async function loadEmployees() {
    try {
        const [employees, users] = await Promise.all([
            apiRequest(EMPLOYEE_URL),
            apiRequest(ADMIN_URL)
        ]);

        allEmployees = employees;
        allUsers = users;

        displayEmployees(allEmployees);

    } catch (error) {
        console.error("Employee loading error:", error);

        employeeTableBody.innerHTML =
            '<tr><td colspan="7">Unable to load employees.</td></tr>';
    }
}


// Display employees

function displayEmployees(employees) {
    employeeTableBody.innerHTML = "";

    if (!employees || employees.length === 0) {
        employeeTableBody.innerHTML =
            '<tr><td colspan="7">No employees found.</td></tr>';

        return;
    }

    employees.forEach(employee => {
        const departmentName = employee.departmentName || "Not Assigned";

        const linkedUser = allUsers.find(user =>
            Number(user.employeeId) === Number(employee.id)
        );

        const accountStatus = linkedUser ? "Active" : "Not Created";
        const statusClass = linkedUser ? "approved" : "pending";

        const accountButton = linkedUser
            ? ""
            : `
                <button type="button"
                    class="create-account-button"
                    onclick="openEmployeeAccountForm(${employee.id})">
                    Create Account
                </button>
            `;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(employee.id)}</td>
            <td>${escapeHtml(employee.name)}</td>
            <td>${escapeHtml(employee.email)}</td>
            <td>₹${escapeHtml(employee.salary)}</td>
            <td>${escapeHtml(departmentName)}</td>

            <td>
                <span class="status ${statusClass}">
                    ${accountStatus}
                </span>
            </td>

            <td>
                ${accountButton}

                <button type="button"
                    class="edit-button"
                    onclick="editEmployee(${Number(employee.id)})">
                    Edit
                </button>

                <button type="button"
                    class="delete-button"
                    onclick="deleteEmployee(${Number(employee.id)})">
                    Delete
                </button>
            </td>
        `;

        employeeTableBody.appendChild(row);
    });
}


// Add or update employee

employeeForm.addEventListener("submit", async event => {
    event.preventDefault();

    const id = employeeId.value;

    const employeeData = {
        name: employeeName.value.trim(),
        email: employeeEmail.value.trim(),
        salary: Number(employeeSalary.value),
        departmentId: Number(employeeDepartment.value)
    };

    const url = id
        ? `${EMPLOYEE_URL}/${id}`
        : EMPLOYEE_URL;

    const method = id ? "PUT" : "POST";

    try {
        await apiRequest(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employeeData)
        });

        alert(
            id
                ? "Employee updated successfully!"
                : "Employee added successfully!"
        );

        employeeForm.reset();
        employeeId.value = "";
        employeeFormCard.hidden = true;

        await loadEmployees();
        await loadDashboard();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});


// Edit employee

async function editEmployee(id) {
    const employee = allEmployees.find(
        item => Number(item.id) === Number(id)
    );

    if (!employee) {
        alert("Employee not found.");
        return;
    }

    await loadEmployeeDepartments();

    employeeId.value = employee.id;
    employeeName.value = employee.name;
    employeeEmail.value = employee.email;
    employeeSalary.value = employee.salary;

    employeeDepartment.value = employee.departmentId ?? "";

    employeeFormTitle.textContent = "Update Employee";
    saveEmployeeButton.textContent = "Update Employee";

    employeeFormCard.hidden = false;
}


// Delete employee

async function deleteEmployee(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        await apiRequest(`${EMPLOYEE_URL}/${id}`, {
            method: "DELETE"
        });

        alert("Employee deleted successfully!");

        await loadEmployees();
        await loadDashboard();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}


// Search employee

employeeSearch.addEventListener("input", () => {
    const searchValue = employeeSearch.value.toLowerCase().trim();

    const filteredEmployees = allEmployees.filter(employee =>
        employee.name.toLowerCase().includes(searchValue)
    );

    displayEmployees(filteredEmployees);
});


// ======================================
// LEAVE MANAGEMENT
// ======================================

const leaveTableBody = document.getElementById("leaveTableBody");


// Load leave requests

async function loadLeaveRequests() {
    try {
        const leaves = await apiRequest(LEAVE_URL);

        leaveTableBody.innerHTML = "";

        if (!leaves || leaves.length === 0) {
            leaveTableBody.innerHTML =
                '<tr><td colspan="7">No leave requests found.</td></tr>';

            return;
        }

        leaves.forEach(leave => {
            const row = document.createElement("tr");

            let actionButtons = "";

            if (leave.status === "PENDING") {
                actionButtons = `
                    <button type="button"
                        class="approve-button"
                        onclick="updateLeaveStatus(${Number(leave.id)}, 'APPROVED')">
                        Approve
                    </button>

                    <button type="button"
                        class="reject-button"
                        onclick="updateLeaveStatus(${Number(leave.id)}, 'REJECTED')">
                        Reject
                    </button>
                `;
            } else {
                actionButtons = "-";
            }

            row.innerHTML = `
                <td>${escapeHtml(leave.id)}</td>
                <td>${escapeHtml(leave.employeeName)}</td>
                <td>${escapeHtml(leave.startDate)}</td>
                <td>${escapeHtml(leave.endDate)}</td>
                <td>${escapeHtml(leave.reason)}</td>

                <td>
                    <span class="status ${escapeHtml(
                        String(leave.status || "").toLowerCase()
                    )}">
                        ${escapeHtml(leave.status)}
                    </span>
                </td>

                <td>${actionButtons}</td>
            `;

            leaveTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Leave loading error:", error);

        leaveTableBody.innerHTML =
            '<tr><td colspan="7">Unable to load leave requests.</td></tr>';
    }
}


// Approve or reject leave

async function updateLeaveStatus(id, status) {
    const confirmed = confirm(
        `Are you sure you want to ${status.toLowerCase()} this leave request?`
    );

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(`${LEAVE_URL}/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: status
            })
        });

        alert(`Leave request ${status.toLowerCase()} successfully!`);

        await loadLeaveRequests();
        await loadDashboard();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}


// ======================================
// USER MANAGEMENT
// ======================================

const userTableBody = document.getElementById("userTableBody");


// Load users

async function loadUsers() {
    try {
        const users = await apiRequest(ADMIN_URL);

        allUsers = users;

        // Refresh employee account status
        if (allEmployees.length > 0) {
            displayEmployees(allEmployees);
        }

        userTableBody.innerHTML = "";

        if (!users || users.length === 0) {
            userTableBody.innerHTML =
                '<tr><td colspan="5">No users found.</td></tr>';

            return;
        }

        users.forEach(user => {
            const row = document.createElement("tr");

            const roleClass =
                user.role === "ADMIN" ? "approved" : "pending";

            row.innerHTML = `
                <td>${escapeHtml(user.userId)}</td>
                <td>${escapeHtml(user.employeeName || "N/A")}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.employeeId ?? "N/A")}</td>

                <td>
                    <span class="status ${roleClass}">
                        ${escapeHtml(user.role)}
                    </span>
                </td>
            `;

            userTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("User loading error:", error);

        userTableBody.innerHTML =
            '<tr><td colspan="5">Unable to load users.</td></tr>';
    }
}


// ======================================
// CREATE ADMIN
// ======================================

const adminFormCard = document.getElementById("adminFormCard");
const adminForm = document.getElementById("adminForm");

const adminEmployee = document.getElementById("adminEmployee");
const adminEmailInput = document.getElementById("adminEmailInput");
const adminPassword = document.getElementById("adminPassword");

const showAdminFormButton = document.getElementById("showAdminForm");
const cancelAdminFormButton = document.getElementById("cancelAdminForm");


// Open Create Admin form

showAdminFormButton.addEventListener("click", async () => {
    console.log("Create Admin button clicked");

    adminForm.reset();
    adminEmailInput.value = "";
    adminFormCard.hidden = false;

    await loadAdminEmployees();
});


// Close Create Admin form

cancelAdminFormButton.addEventListener("click", () => {
    adminForm.reset();
    adminFormCard.hidden = true;
});


// Load employees who do not already have a user account

async function loadAdminEmployees() {
    try {
        const [employees, users] = await Promise.all([
            apiRequest(EMPLOYEE_URL),
            apiRequest(ADMIN_URL)
        ]);

        const registeredEmployeeIds = new Set(
            users.map(user => Number(user.employeeId))
        );

        const availableEmployees = employees.filter(
            employee => !registeredEmployeeIds.has(Number(employee.id))
        );

        adminEmployee.innerHTML =
            '<option value="">Select Employee</option>';

        if (availableEmployees.length === 0) {
            adminEmployee.innerHTML =
                '<option value="">No available employees</option>';

            return;
        }

        availableEmployees.forEach(employee => {
            const option = document.createElement("option");

            option.value = employee.id;
            option.textContent =
                `${employee.name} (ID: ${employee.id})`;

            option.dataset.email = employee.email;

            adminEmployee.appendChild(option);
        });

    } catch (error) {
        console.error("Admin employee loading error:", error);

        alert("Unable to load employees: " + error.message);
    }
}


// Automatically fill employee email

adminEmployee.addEventListener("change", () => {
    const selectedOption =
        adminEmployee.options[adminEmployee.selectedIndex];

    adminEmailInput.value =
        selectedOption?.dataset.email || "";
});


// Create Admin form submission

adminForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!adminEmployee.value) {
        alert("Please select an employee.");
        return;
    }

    const adminData = {
        employeeId: Number(adminEmployee.value),
        email: adminEmailInput.value,
        password: adminPassword.value
    };

    try {
        const result = await apiRequest(ADMIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(adminData)
        });

        alert("Admin created successfully!");

        console.log("Created admin:", result);

        adminForm.reset();
        adminFormCard.hidden = true;

        await loadUsers();
        await loadEmployees();

    } catch (error) {
        console.error("Create Admin error:", error);
        alert(error.message);
    }
});


// ======================================
// DEPARTMENT MANAGEMENT
// ======================================

const DEPARTMENT_API = "/api/departments";

const departmentFormCard =
    document.getElementById("departmentFormCard");

const departmentForm =
    document.getElementById("departmentForm");

const departmentId =
    document.getElementById("departmentId");

const departmentNameInput =
    document.getElementById("departmentName");

const departmentTableBody =
    document.getElementById("departmentTableBody");

const departmentEmployeesCard =
    document.getElementById("departmentEmployeesCard");

const departmentEmployeesBody =
    document.getElementById("departmentEmployeesBody");

const departmentEmployeesTitle =
    document.getElementById("departmentEmployeesTitle");

const departmentFormTitle =
    document.getElementById("departmentFormTitle");

const saveDepartmentButton =
    document.getElementById("saveDepartmentButton");

let allDepartments = [];


// Show department form

document.getElementById("showDepartmentForm")
    .addEventListener("click", () => {
        departmentForm.reset();

        departmentId.value = "";

        departmentFormTitle.textContent = "Add New Department";
        saveDepartmentButton.textContent = "Save Department";

        departmentFormCard.hidden = false;
    });


// Cancel department form

document.getElementById("cancelDepartmentForm")
    .addEventListener("click", () => {
        departmentForm.reset();

        departmentId.value = "";

        departmentFormCard.hidden = true;
    });


// Load all departments

async function loadDepartments() {
    try {
        const [departments, employees] = await Promise.all([
            apiRequest(DEPARTMENT_API),
            apiRequest(EMPLOYEE_URL)
        ]);

        allDepartments = departments;

        displayDepartments(departments, employees);

    } catch (error) {
        console.error("Department loading error:", error);

        departmentTableBody.innerHTML =
            `<tr><td colspan="4">${escapeHtml(error.message)}</td></tr>`;
    }
}


// Display departments

function displayDepartments(departments, employees) {
    departmentTableBody.innerHTML = "";

    if (!departments || departments.length === 0) {
        departmentTableBody.innerHTML =
            '<tr><td colspan="4">No departments found.</td></tr>';

        return;
    }

    departments.forEach(department => {
        const employeeCount = employees.filter(employee =>
            Number(employee.departmentId) === Number(department.id)
        ).length;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(department.id)}</td>
            <td>${escapeHtml(department.name)}</td>
            <td>${employeeCount}</td>

            <td>
                <button type="button"
                    class="view-button"
                    onclick="viewDepartmentEmployees(${Number(department.id)})">
                    View
                </button>

                <button type="button"
                    class="edit-button"
                    onclick="editDepartment(${Number(department.id)})">
                    Edit
                </button>

                <button type="button"
                    class="delete-button"
                    onclick="deleteDepartment(${Number(department.id)})">
                    Delete
                </button>
            </td>
        `;

        departmentTableBody.appendChild(row);
    });
}


// Add or update department

departmentForm.addEventListener("submit", async event => {
    event.preventDefault();

    const id = departmentId.value;

    const departmentData = {
        name: departmentNameInput.value.trim()
    };

    if (!departmentData.name) {
        alert("Please enter a department name.");
        return;
    }

    const url = id
        ? `${DEPARTMENT_API}/${id}`
        : DEPARTMENT_API;

    const method = id ? "PUT" : "POST";

    try {
        await apiRequest(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(departmentData)
        });

        alert(
            id
                ? "Department updated successfully!"
                : "Department added successfully!"
        );

        departmentForm.reset();
        departmentId.value = "";
        departmentFormCard.hidden = true;
        departmentEmployeesCard.hidden = true;

        await loadDepartments();
        await loadEmployeeDepartments();
        await loadDashboard();

    } catch (error) {
        console.error("Department save error:", error);
        alert(error.message);
    }
});


// Edit department

function editDepartment(id) {
    const department = allDepartments.find(item =>
        Number(item.id) === Number(id)
    );

    if (!department) {
        alert("Department not found.");
        return;
    }

    departmentId.value = department.id;
    departmentNameInput.value = department.name;

    departmentFormTitle.textContent = "Update Department";
    saveDepartmentButton.textContent = "Update Department";

    departmentFormCard.hidden = false;

    departmentNameInput.focus();
}


// Delete department

async function deleteDepartment(id) {
    const department = allDepartments.find(item =>
        Number(item.id) === Number(id)
    );

    if (!department) {
        alert("Department not found.");
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete ${department.name}?`
    );

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(`${DEPARTMENT_API}/${id}`, {
            method: "DELETE"
        });

        alert("Department deleted successfully!");

        departmentEmployeesCard.hidden = true;

        await loadDepartments();
        await loadEmployeeDepartments();
        await loadDashboard();

    } catch (error) {
        console.error("Department delete error:", error);

        alert(
            "Unable to delete department. If employees are assigned to it, " +
            "reassign them first.\n\n" + error.message
        );
    }
}


// View employees belonging to a department

async function viewDepartmentEmployees(id) {
    const department = allDepartments.find(item =>
        Number(item.id) === Number(id)
    );

    if (!department) {
        alert("Department not found.");
        return;
    }

    try {
        const employees = await apiRequest(
            `${DEPARTMENT_API}/${id}/employees`
        );

        departmentEmployeesCard.hidden = false;

        departmentEmployeesTitle.textContent =
            `Employees - ${department.name}`;

        departmentEmployeesBody.innerHTML = "";

        if (!employees || employees.length === 0) {
            departmentEmployeesBody.innerHTML =
                '<tr><td colspan="4">No employees in this department.</td></tr>';

        } else {
            employees.forEach(employee => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${escapeHtml(employee.id)}</td>
                    <td>${escapeHtml(employee.name)}</td>
                    <td>${escapeHtml(employee.email)}</td>
                    <td>₹${escapeHtml(employee.salary)}</td>
                `;

                departmentEmployeesBody.appendChild(row);
            });
        }

        departmentEmployeesCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        console.error("Department employees error:", error);
        alert(error.message);
    }
}


// ======================================
// CREATE EMPLOYEE ACCOUNT
// ======================================

const employeeAccountFormCard =
    document.getElementById("employeeAccountFormCard");

const employeeAccountForm =
    document.getElementById("employeeAccountForm");

const accountEmployeeId =
    document.getElementById("accountEmployeeId");

const accountEmployeeName =
    document.getElementById("accountEmployeeName");

const accountEmployeeEmail =
    document.getElementById("accountEmployeeEmail");

const accountPassword =
    document.getElementById("accountPassword");


// Open employee account form
// IMPORTANT: This function is exposed globally for inline onclick.

window.openEmployeeAccountForm = function(id) {
    const employee = allEmployees.find(
        item => Number(item.id) === Number(id)
    );

    if (!employee) {
        alert("Employee not found.");
        return;
    }

    employeeAccountForm.reset();

    accountEmployeeId.value = employee.id;
    accountEmployeeName.value = employee.name;
    accountEmployeeEmail.value = employee.email;

    employeeAccountFormCard.hidden = false;

    accountPassword.focus();
};


// Cancel account form

document.getElementById("cancelEmployeeAccount")
    .addEventListener("click", () => {
        employeeAccountForm.reset();

        employeeAccountFormCard.hidden = true;
    });


// Submit employee account form

employeeAccountForm.addEventListener("submit", async event => {
    event.preventDefault();

    const accountData = {
        employeeId: Number(accountEmployeeId.value),
        email: accountEmployeeEmail.value,
        password: accountPassword.value
    };

    try {
        await apiRequest(EMPLOYEE_ACCOUNT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(accountData)
        });

        alert("Employee login account created successfully!");

        employeeAccountForm.reset();
        employeeAccountFormCard.hidden = true;

        // Refresh employee list and account status
        await loadEmployees();

        // Refresh user management table
        await loadUsers();

    } catch (error) {
        console.error("Employee account creation error:", error);
        alert(error.message);
    }
});


// ======================================
// EXPOSE FUNCTIONS FOR INLINE HTML onclick
// ======================================

window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;

window.updateLeaveStatus = updateLeaveStatus;

window.editDepartment = editDepartment;
window.deleteDepartment = deleteDepartment;
window.viewDepartmentEmployees = viewDepartmentEmployees;


// ======================================
// INITIAL PAGE LOAD
// ======================================

// Show dashboard first

showSection("dashboard");
