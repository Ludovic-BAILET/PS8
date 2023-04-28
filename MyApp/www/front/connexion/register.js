const url =  session.url;

const form = document.getElementById("loginForm");

const errorMessage = document.getElementById("error-message");

function check(values){
    if(values.username.length < 5){
        errorMessage.textContent = "Le nom d'utilisateur doit faire au moins 5 caractères";
        return false;
    }if (values.password.length < 8) {
        errorMessage.textContent = "Le mot de passe doit faire au moins 8 caractères";
        return false;
    }else return true;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const mail = document.getElementById("mail").value;
    const password = document.getElementById("password").value;
    const confirmedPassword = document.getElementById("confirmPassword").value;
    // La on doit rajouter les amis et tout !
    const values = {
        username: username,
        password: password,
        mail: mail,
    }

    if (!username || !password || password !== confirmedPassword || !mail) {
        errorMessage.textContent = "Veuillez remplir tous les champs";
        return;
    }if(!check(values)){
        return;
    }
    else{
        fetch(url+"/api/signup", {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify(values)
        }).then(async (response) => {
            if (response.status === 400) {
                errorMessage.textContent = "Nom d'utilisateur déjà utilisé";
                return;
            }else{
                let token = await response.text();
                localStorage.setItem("access_token", token);
                location.href = "../index.html";
            }
        });
    }
});
