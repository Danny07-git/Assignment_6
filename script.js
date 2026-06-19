document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("trivia-form");
    const questionContainer = document.getElementById("question-container");
    const usernameInput = document.getElementById("username");
    const newPlayerButton = document.getElementById("new-player");

    checkUsername();
    fetchQuestions();
    displayScores();

    // --------------------
    // Fetch Questions
    // --------------------
    function fetchQuestions() {

        showLoading(true);

        fetch("https://opentdb.com/api.php?amount=10&type=multiple")
            .then(response => response.json())
            .then(data => {
                displayQuestions(data.results);
                showLoading(false);
            })
            .catch(error => {
                console.error("Error:", error);
                showLoading(false);
            });
    }

    // --------------------
    // Loading Screen
    // --------------------
    function showLoading(isLoading) {

        document.getElementById("loading-container").className =
            isLoading ? "" : "hidden";

        questionContainer.className =
            isLoading ? "hidden" : "";
    }

    // --------------------
    // Display Questions
    // --------------------
    function displayQuestions(questions) {

        questionContainer.innerHTML = "";

        questions.forEach((question, index) => {

            const questionDiv = document.createElement("div");

            questionDiv.innerHTML = `
                <p>${question.question}</p>
                ${createAnswerOptions(
                    question.correct_answer,
                    question.incorrect_answers,
                    index
                )}
            `;

            questionContainer.appendChild(questionDiv);
        });
    }

    // --------------------
    // Create Answers
    // --------------------
    function createAnswerOptions(correct, incorrect, index) {

        const answers = [correct, ...incorrect]
            .sort(() => Math.random() - 0.5);

        return answers.map(answer => `
            <label>
                <input
                    type="radio"
                    name="answer${index}"
                    value="${answer}"
                    ${answer === correct ? 'data-correct="true"' : ""}
                >
                ${answer}
            </label>
        `).join("");
    }

    // --------------------
    // Cookie Functions
    // --------------------
    function setCookie(name, value, days) {

        const date = new Date();

        date.setTime(
            date.getTime() +
            (days * 24 * 60 * 60 * 1000)
        );

        document.cookie =
            `${name}=${value};expires=${date.toUTCString()};path=/`;
    }

    function getCookie(name) {

        const cookieName = name + "=";

        const cookies = document.cookie.split(";");

        for (let cookie of cookies) {

            cookie = cookie.trim();

            if (cookie.indexOf(cookieName) === 0) {

                return cookie.substring(cookieName.length);
            }
        }

        return "";
    }

    // --------------------
    // Check User
    // --------------------
    function checkUsername() {

        const username = getCookie("username");

        if (username !== "") {

            usernameInput.value = username;

            newPlayerButton.classList.remove("hidden");
        }
    }

    // --------------------
    // Calculate Score
    // --------------------
    function calculateScore() {

        let score = 0;

        const selectedAnswers =
            document.querySelectorAll(
                'input[type="radio"]:checked'
            );

        selectedAnswers.forEach(answer => {

            if (answer.dataset.correct === "true") {

                score++;
            }
        });

        return score;
    }

    // --------------------
    // Save Score
    // --------------------
    function saveScore(username, score) {

        let scores =
            JSON.parse(localStorage.getItem("scores")) || [];

        scores.push({
            username: username,
            score: score
        });

        localStorage.setItem(
            "scores",
            JSON.stringify(scores)
        );
    }

    // --------------------
    // Display Scores
    // --------------------
    function displayScores() {

        const tbody =
            document.querySelector("#score-table tbody");

        tbody.innerHTML = "";

        const scores =
            JSON.parse(localStorage.getItem("scores")) || [];

        scores.forEach(entry => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${entry.username}</td>
                <td>${entry.score}</td>
            `;

            tbody.appendChild(row);
        });
    }

    // --------------------
    // New Player
    // --------------------
    function newPlayer() {

        document.cookie =
            "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        usernameInput.value = "";

        newPlayerButton.classList.add("hidden");
    }

    // --------------------
    // Form Submit
    // --------------------
    function handleFormSubmit(event) {

        event.preventDefault();

        const username =
            usernameInput.value.trim();

        if (username === "") {

            alert("Please enter your name.");

            return;
        }

        if (getCookie("username") === "") {

            setCookie("username", username, 7);
        }

        const score = calculateScore();

        saveScore(username, score);

        displayScores();

        alert(
            `${username}, your score is ${score}/10`
        );

        fetchQuestions();
    }

    form.addEventListener(
        "submit",
        handleFormSubmit
    );

    newPlayerButton.addEventListener(
        "click",
        newPlayer
    );
});