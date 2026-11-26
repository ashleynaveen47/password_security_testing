const password = document.getElementById("password");

let currentScore = 0;
let currentStrength = "Weak";


// Password analysis

password.addEventListener("input", checkPassword);


function checkPassword() {

    const value = password.value;

    const checks = {

        length: value.length >= 8,

        uppercase: /[A-Z]/.test(value),

        lowercase: /[a-z]/.test(value),

        number: /[0-9]/.test(value),

        special: /[^A-Za-z0-9]/.test(value)

    };


    let score = 0;

    const labels = {

        length: "At least 8 characters",

        uppercase: "One uppercase letter",

        lowercase: "One lowercase letter",

        number: "One numerical digit",

        special: "One special character"

    };


    for (let key in checks) {

        const element = document.getElementById(key);

        const valid = checks[key];

        if (valid) {

            score += 20;

            element.classList.add("valid");

        } else {

            element.classList.remove("valid");

        }

        element.innerHTML =
            `<span>${valid ? "✓" : "○"}</span>${labels[key]}`;

    }


    if (value.length === 0) {

        score = 0;

        currentStrength = "Weak";

    }

    else if (score < 40) {

        currentStrength = "Weak";

    }

    else if (score < 80) {

        currentStrength = "Medium";

    }

    else {

        currentStrength = "Strong";

    }


    currentScore = score;


    document.getElementById("score").textContent = score;

    document.getElementById("strength").textContent =
        value.length === 0 ? "Not Tested" : currentStrength;


    const bar = document.getElementById("progress-bar");

    bar.style.width = score + "%";


    if (score < 40) {

        bar.style.background = "#ef4444";

    }

    else if (score < 80) {

        bar.style.background = "#f59e0b";

    }

    else {

        bar.style.background = "#22c55e";

    }

}


// Show and hide password

function togglePassword() {

    const button = document.getElementById("toggle-btn");

    if (password.type === "password") {

        password.type = "text";

        button.textContent = "HIDE";

    } else {

        password.type = "password";

        button.textContent = "SHOW";

    }

}


// Save test result

async function saveResult() {

    const value = password.value;

    const message = document.getElementById("message");

    if (value.length === 0) {

        message.textContent = "Please enter a password first.";

        message.style.color = "#ef4444";

        return;

    }


    const button = document.querySelector(".analyze-btn");

    button.disabled = true;

    try {

        const response = await fetch("/save", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                score: currentScore,

                strength: currentStrength,

                length: value.length

            })

        });


        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to save result.");
        }

        message.textContent = result.message;

        message.style.color = "#4ade80";

        password.value = "";

        checkPassword();

        await loadHistory();

    }

    catch (error) {

        message.textContent = error.message;

        message.style.color = "#ef4444";

    }

    finally {

        button.disabled = false;

    }

}


// Display history

async function loadHistory() {

    const history = document.getElementById("history");

    history.innerHTML = "Loading...";

    try {

        const response = await fetch("/history");

        if (!response.ok) {
            throw new Error("Unable to load history.");
        }

        const records = await response.json();

        history.innerHTML = "";

        if (records.length === 0) {

            history.textContent = "No testing history available.";

            return;

        }


        records.forEach(record => {

            const item = document.createElement("div");

            item.className = "history-item";

            item.textContent =
                "Score: " + record[0] + "/100" +
                " | Strength: " + record[1] +
                " | Length: " + record[2] +
                " | Date: " + record[3];

            history.appendChild(item);

        });

    }

    catch (error) {

        history.textContent = error.message;

    }

}