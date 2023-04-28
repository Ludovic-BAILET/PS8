const form = document.getElementById("loginForm");

const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const values = {
        username: username,
        password: password
    }
    if (!username || !password) {
        errorMessage.textContent = "Veuillez saisir un nom d'utilisateur et un mot de passe valides.";
        return;

    } else {
        fetch(session.url + "/api/login/", {
            method: "POST",
            headers: {'Content-Type': "application/json"},
            body: JSON.stringify(values)

        }).then(async (response) => {
            let token = await response.text();
            if (token.length > 10) { // if the token is not null, have to change the condition.
                localStorage.setItem("access_token", token);
                location.href = "../index.html";
            }else{
                alert("mauvaise identification");
            }
        });
    }
});





