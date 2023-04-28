const challengeList = document.getElementById("challenges-list");
session.socket.on("updateChallenges", (data) => {
    getChallenges();
});
let challenges = [];
getChallenges();
function getChallenges(){
    let token = localStorage.getItem("access_token");
    fetch(session.url +"/api/challenges/", {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Usually there is a real syntax for tokens to be recognized, but here we don't need special treatment.
                'Token': token
            },

        }).then(async (response) => {
            let challengeResponse = await response.text();
            challenges = JSON.parse(challengeResponse);
            if(challenges.length > 0){
                showChallenges();
            } else {
                document.getElementById("challenges-list").innerHTML = "Vous n'avez pas de défis en attente";
            }
        });
}

function showChallenges(){
    let index = 0;
    document.getElementById("challenges-list").innerHTML = "";
    for(let i = 0; i< challenges.length; i++){
        let challenge = JSON.parse(challenges[i]);
        // container
        let container = document.createElement("div");
        container.setAttribute("class","container");

        // Image
        let image = document.createElement("img");
        image.setAttribute("class", "imageLeft");

        image.src = "../ressources/vs.jpg";
        container.appendChild(image);

        //Right part
        let right = document.createElement("div");
        right.setAttribute("class","rightPart");
        container.appendChild(right);

        // Nom de la partie
        let nameGame = document.createElement("div");
        nameGame.setAttribute("class", "nameGame");
        nameGame.innerHTML = challenge.challenger + " vous a défié ! ";
        right.appendChild(nameGame);

        //button pour reprendre la game
        let btn = document.createElement("button");
        btn.setAttribute("class","resumeGame");
        btn.addEventListener("click", () => {
            chooseChallenge(challenge.nameGame);
        });
        btn.innerHTML = "Accepter";
        right.appendChild(btn);

        challengeList.appendChild(container);
        index++;
    }
}

function chooseChallenge(UUID){
    let parametre = 'acceptChallenge';
    let nouvelleUrl = location.href + '?typegame=' + parametre + '?game=' + UUID;
    location.href = "../game/game.html" + '?typegame=' + parametre + '&game=' + UUID;
}

const succesButton = document.getElementById("succesButton");

succesButton.addEventListener("click", function (event) {
    event.preventDefault();
    addAchievment();
    alert("Bravo ! Vous avez trouvé un bouton caché!");
});

function addAchievment(event){
    fetch(session.url + "/api/addAchievement/", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            //Usually there is a real syntax for tokens to be recognized, but here we don't need special treatment.
            'Token': localStorage.getItem("access_token")
        },
        body: JSON.stringify({achievement: "Bouton1"})
    }).then(async (response) => {
        if (response.status === 200) {
        } else {
            console.log("Error while adding achievement");
        }
    })
}
