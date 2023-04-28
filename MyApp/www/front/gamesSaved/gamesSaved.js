const gameList = document.getElementById("games");

let games = [];
getGames();
function getGames(){
    let token = localStorage.getItem("access_token");
    fetch(session.url +"/api/games_saved/", {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Usually there is a real syntax for tokens to be recognized, but here we don't need special treatment.
                'Token': token
            },

        }).then(async (response) => {
            let gamesResponse = await response.text();
            games = JSON.parse(gamesResponse);
            showGames();
        });
}

function showGames(){
    let index = 0;
    for(let i = 0; i< games.length; i++){
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
        nameGame.innerHTML = "Game "+ index;
        right.appendChild(nameGame);

        //button pour reprendre la game
        let btn = document.createElement("button");
        btn.setAttribute("class","resumeGame");
        btn.addEventListener("click", () => {
            chooseGame(games[i].UUID);
        });
        btn.innerHTML = "Reprendre la partie";
        right.appendChild(btn);

        gameList.appendChild(container);
        index++;
    }
}

function chooseGame(UUID){
    let parametre = 'resumeGame';
    let nouvelleUrl = location.href + '?typegame=' + parametre + '?game=' + UUID;
    location.href = "../game/game.html" + '?typegame=' + parametre + '&game=' + UUID;
}
