const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = loginForm.identifier.value.trim();
    const password = loginForm.password.value.trim();

    if (!identifier) {
        alert("Please enter your username or email.");
        return;
    }

    if (!password) {
        alert("Please enter your password.");
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({identifier, password })
        });

        const result = await response.json();

        if(response.ok && result.success) {
            alert("You have successfuly logged in.");
            loginErrorMsg.classList.remove('show');
            window.location.href = "index.html";
        } else {
            loginErrorMsg.classList.add('show');
        }
    } catch (error) {
        console.error("Login request failed:", error);
        alert("An error occured. Please try again.")
    }
    /*if (username === "admin" && password === "admin") {
        alert("You have successfully logged in.");
        window.location.href = "index.html";
    } else {
        loginErrorMsg.style.opacity = 1;
        loginErrorMsg.style.visibility = 'visible';
    }*/
});

