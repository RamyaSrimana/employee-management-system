
const token = sessionStorage.getItem("token");
const role = sessionStorage.getItem("role");

if (!token || role !== "USER") {
    window.location.href = "/login.html";
}

const API_HEADERS = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
};

// Common API helper
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...API_HEADERS,
            ...options.headers
        }
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(text || `Request failed: ${response.status}`);
    }

    return text ? JSON.parse(text) : null;
}

// Load employee profile
async function loadMyProfile() {
    try {
        const employee = await apiRequest("/api/employees/me");

        document.getElementById("employeeEmail").textContent = employee.email;
        document.getElementById("profileName").textContent = employee.name;
        document.getElementById("profileEmail").textContent = employee.email;

        document.getElementById("profileInitial").textContent =
            employee.name.charAt(0).toUpperCase();

        document.getElementById("employeeId").textContent = employee.id;

        document.getElementById("employeeSalary").textContent =
            "₹" + Number(employee.salary).toLocaleString("en-IN");

        document.getElementById("employeeDepartment").textContent =
            employee.departmentName || "Not Assigned";

    } catch (error) {
        alert("Unable to load employee profile: " + error.message);
    }
}

// Load my leave requests
async function loadMyLeaves() {
    const tableBody = document.getElementById("myLeaveTableBody");

    try {
        const leaves = await apiRequest("/api/leaves/my");

        if (!leaves || leaves.length === 0) {
            tableBody.innerHTML =
                `<tr><td colspan="5">No leave requests found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = leaves.map(leave => `
            <tr>
                <td>${leave.id}</td>
                <td>${escapeHtml(leave.startDate)}</td>
                <td>${escapeHtml(leave.endDate)}</td>
                <td>${escapeHtml(leave.reason)}</td>
                <td>
                    <span class="status ${leave.status}">
                        ${escapeHtml(leave.status)}
                    </span>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        tableBody.innerHTML =
            `<tr><td colspan="5">Unable to load leave requests.</td></tr>`;
        console.error(error);
    }
}

// Prevent HTML injection in table values
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Apply for leave
document.getElementById("leaveForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const reason = document.getElementById("leaveReason").value.trim();

    if (endDate < startDate) {
        alert("End date cannot be before start date.");
        return;
    }

    try {
        const result = await apiRequest("/api/leaves", {
            method: "POST",
            body: JSON.stringify({
                startDate,
                endDate,
                reason
            })
        });

        alert(result.message || "Leave request submitted successfully!");

        this.reset();
        await loadMyLeaves();

        showSection("my-leaves");

    } catch (error) {
        alert("Unable to apply for leave: " + error.message);
    }
});

// Navigation
function showSection(sectionId) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");

    const activeLink = document.querySelector(
        `.nav-link[data-section="${sectionId}"]`
    );

    if (activeLink) {
        activeLink.classList.add("active");
    }

    if (sectionId === "my-leaves") {
        loadMyLeaves();
    }
}

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        showSection(this.dataset.section);
    });
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", function() {
    sessionStorage.clear();
    window.location.href = "/login.html";
});

// Initial loading
loadMyProfile();
loadMyLeaves();

// Set minimum leave date to today
const today = new Date();
const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

document.getElementById("startDate").min = localToday;
document.getElementById("endDate").min = localToday;

document.getElementById("startDate").addEventListener("change", function() {
    document.getElementById("endDate").min = this.value || localToday;
});
