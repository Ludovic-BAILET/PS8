function sessionManager() {
    this.login = document.getElementById("login");
    this.deconnexionButton = document.getElementById("deconnexion");
    this.deconnexionButton2 = document.getElementById("deconnexion2");
    this.sousMenu = document.getElementById("sousMenuProfil");
    this.navConnection = document.getElementById("navConnectionID");
    this.navConnection2 = document.getElementById("seConnecter2");
    // import {getName, getMail} from "./getInfo";
    this.url = "http://2puissance2.connect4.academy";
    // this.url = "http://localhost";

    let lockThePhoneScreen = function () {
        console.log("lock");
        screen.orientation.lock("landscape");
    }



    if (localStorage.getItem("access_token")){
        // faudrait faire une fonction pour ce fetch du genre ValidToken
            fetch(this.url + "/api/getToken/", {
                method: "get",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // Usually there is a real syntax for tokens to be recognized, but here we don't need special treatment.
                    'Token': localStorage.getItem("access_token")
                }
            }).then(async (response) => {
                if(response.status === 418){
                    this.deconnexion();
                    location.href = "../index.html";
                }
            });

        this.socket = io(this.url, {query: "token=" + localStorage.getItem("access_token")});
        this.socket.on("newChallenge", (data) => {
            this.newChallenges(data);
        });

        this.socket.on("cancelChallenge", (data) => {
            this.cancelChallenges(data);
        });
    }

    this.deconnexion = function () {
        console.log("deconnexion");
        localStorage.removeItem("username");
        localStorage.removeItem("access_token");
        localStorage.removeItem("notificationsFriend");
        localStorage.removeItem("notificationsChallenge");
        location.href = "../index.html";
    }

    this.getName = function () {
        let token = localStorage.getItem("access_token");
        fetch(this.url + "/api/getToken/", {
            method: "get",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Usually there is a real syntax for tokens to be recognized, but here we don't need special treatment.
                'Token': token
            },
        }).then(async (response) => {
            let data = await response.text();
            // get the name field of the user in the data
            if (JSON.parse(data) !== null || data !== "null") {
                this.login.innerText = JSON.parse(data).username;
                localStorage.setItem("username", JSON.parse(data).username);
                this.login.removeAttribute("href");
                this.sousMenu.style.visibility = "visible";
                this.navConnection.style.visibility = "visible";
                this.navConnection2.removeAttribute("href");
                this.navConnection2.innerText = JSON.parse(data).username;
                // this.socket = io(this.url, {query: "token=" + localStorage.getItem("access_token")});
            } else {
                this.deconnexion();
                this.login.innerText = "Se Connecter"
            }
        });
    }

    this.deconnexionButton.addEventListener("click", this.deconnexion);
    this.deconnexionButton2.addEventListener("click", this.deconnexion);

    if (localStorage.getItem("access_token") !== null) {
        // console.log("On essaye de recuperer le nom du token: " + localStorage.getItem("access_token"));
        this.getName();
    } else {
        console.log("Pas de token");
        this.login.innerText = "Se Connecter";
        localStorage.removeItem("access_token");
    }

    this.newChallenges = function(data) {console.log(data);}

    this.cancelChallenges = function(data) {console.log(data);}
    console.log("on est dans session.js");


}

document.addEventListener("deviceready", function () {
    console.log("lock");
    // screen.orientation.lock("landscape");
    try{
        screen.orientation.unlock();
    } catch {
        console.log("pas de lock");
    }
});

let session = new sessionManager();
