
const LOGIN_URL = "/api/auth/login";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const loginButton = document.getElementById("loginButton");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";
    message.textContent = "";

    try {

        const response = await fetch(LOGIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const responseText = await response.text();

        const data = responseText
            ? JSON.parse(responseText)
            : {};

        if (!response.ok) {
            throw new Error(
                data.message || "Login failed. Check your email and password."
            );
        }

        if (!data.token || !data.role) {
            throw new Error("Login response is missing token or role.");
        }

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("employeeId", data.employeeId);

        message.style.color = "green";
        message.textContent = "Login successful! Welcome " + data.role;

        loginButton.textContent = "Success!";
		if (data.role === "ADMIN") {
		    window.location.href = "/admin-dashboard.html";
		}
		else {
		    window.location.href = "/employee-dashboard.html";
		}

    } catch (error) {

        message.style.color = "red";
        message.textContent = error.message;

        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
});
