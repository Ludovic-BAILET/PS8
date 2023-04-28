/**
 * Récupération des élements du html
 */
const table = document.getElementById("table");
table.addEventListener('mouseover', previsualisation);
table.addEventListener('mouseout', deletePrevisualisation);

const gameOverPopup = document.getElementById("gameOverPopup");
gameOverPopup.style.display ="none";

const equality = document.getElementById("equality");
equality.style.display ="none";

const saveGameButton = document.getElementById("saveGameButton");
saveGameButton.style.display = "none";

const whoStart = document.getElementById("whoStart");
whoStart.style.display ="none";

const wainting = document.getElementById("wainting");
wainting.style.display ="none";

// on crée une socket
let socket = session.socket ? session.socket : io(session.url,);
let previsualisationColor ="previsualisationyellow";
let id = 2; // id = 2 si le joueur commence, id = 1 si l'IA commence

let UUID;
let friend;
let board;

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let typegame = urlParams.get('typegame');

let online = false;

let local_player = 0;

let media;

socket.on("redirect", function(url) {
    location.href = "../connexion/login.html";
});

document.addEventListener("deviceready", function () {
    console.log("lock");
    window.addEventListener("batterystatus", onBatteryStatus, false);

    // screen.orientation.lock("landscape");
    try{
        screen.orientation.lock("landscape");
    } catch {
        console.log("pas de lock");
    }
    media = new Media("/front/ressources/audio/A_toi_de_jouer.mp3", function () {console.log("success");}, function (err) {console.log("error : " + err);});
});



function onBatteryStatus(status) {
    console.log("Level: " + status.level + " isPlugged: " + status.isPlugged);
}

initBoard();
// On envoie au lancement de la partie, le premier joueur a jouer.
if("gameIA" == typegame){
    document.getElementById("chat").style.display = "none";
    //socket.emit('AIplays', JSON.stringify(id));
    let token = localStorage.getItem("access_token");
    if(token !== null){
        saveGameButton.style.display = "";
    }
    whoStart.style.display = "";
} else if("gameLocal" == typegame) {
    document.getElementById("chat").style.display = "none";
    console.log("gameLocal");
    socket.emit('1vs1LocalPlays', JSON.stringify(id));
} else if("resumeGame" == typegame) {
    document.getElementById("chat").style.display = "none";
    UUID =  urlParams.get('game');
    let data = {
        id: id,
        UUID: UUID,
    }
    socket.emit('resumeGame', JSON.stringify(data));
    let url = new URL(location.href);
    url.searchParams.delete("game");
    url.searchParams.set("typegame", "gameIA");
    history.replaceState(null, null, url);
    saveGameButton.style.display = "";
} else if('gameOnlineRandom' == typegame){
    let token = localStorage.getItem("access_token");
    socket.emit('OnlineRandomPlays', JSON.stringify(token));
}else if('gameOnlineRanked' == typegame){
    let token = localStorage.getItem("access_token");
    socket.emit('OnlineRanked', JSON.stringify(token));
}else if('acceptChallenge' == typegame){
    console.log("acceptChallenge");
    UUID =  urlParams.get('game');
    let data = {
        id: id,
        UUID: UUID
    }
    socket.emit('acceptChallenge', JSON.stringify(data));
    let url = new URL(location.href);
    url.searchParams.delete("game");
    url.searchParams.set("typegame", "O");
    //history.replaceState(null, null, url);
}else if('challenge' == typegame){
    console.log("NEW challenge");
    console.log("challenge");
    friend =  urlParams.get('friend');
    let token = localStorage.getItem("access_token");
    let username = localStorage.getItem("username");
    socket.emit("challenge", JSON.stringify({challenger: username, challenged: friend, token: token}));
}else {
    location.href = "../index.html";
}

function IAStart(){
    id = 1;
    socket.emit('AIplays', JSON.stringify(id));
    whoStart.style.display ="none";

}

function playerStart(){
    id = 2;
    socket.emit('AIplays', JSON.stringify(id));
    whoStart.style.display ="none";

}

socket.on('idGame', getIdGame);
socket.on('initialColor', initialColor);
socket.on('wainting', playerWainting);
socket.on('ready', ready);

function initialColor(result){
    local_player = JSON.parse(result);
    changeColor(local_player);
    online = true;
}

function playerWainting(){
    wainting.style.display ="";
}

function ready(){
    wainting.style.display ="none";
}

function getIdGame(result){
    UUID = JSON.parse(result);
}

function initBoard(){
    socket.on('updatedBoard', updatedBoard);
    socket.on('setBoard', setBoard);
    board = new Array(7);
    for (let i = 0; i < 7; i++)
    {
        board[i] = new Array(6);
        for (let j = 0; j < 6; j++){
            board[i][j] = 0;
        }
    }
}

/**
 * Méthode pour récupérer le résultat du back et mettre à jour le board
 * @param {*} result
 */
function updatedBoard(result){
    console.log("updatedBoard");
    let response = JSON.parse(result);
    let newBoard = response.board;
    for(let i = 0; i < 7; i++){
        for(let j = 0; j < 6; j++){
            if(board[i][j] !== newBoard[i][j]){
                board[i][j] = newBoard[i][j];
                document.getElementById(placeFromId([i, j])).setAttribute("class",colorFromInt(newBoard[i][j]) + " animate"+j);
            }
        }
    }
    //Vérification de la victoire calculé par le back
    if(response.win){
        endWithBackend(response.colorWinner);
    }
    //Vérification de l'égalité calculé par le back
    if(response.equality){
        endEquality();
    }
    if (!online){
        changeColor(response.player);
    }
    changeColorWhoPlay(response.player);
}

function setBoard(result){
    let response = JSON.parse(result);
    let newBoard = response.board;
    for(let i = 0; i < 7; i++){
        for(let j = 0; j < 6; j++){
            if( 0 !== newBoard[i][j]){
                document.getElementById(placeFromId([i, j])).setAttribute("class",colorFromInt(newBoard[i][j]));
            }
        }
    }
    board = newBoard;
}

/**
 * Change la couleur du player courant
 * @param {*} player
 */
function changeColor(player){
    let color = (player === 0) ? "yellow" : "red";
    previsualisationColor = (player === 0) ? "previsualisationyellow" : "previsualisationred";
    document.getElementById("disk").setAttribute("class", color);
}

function changeColorWhoPlay(player){
    let color = (player === 0) ? "yellow" : "red";
    document.getElementById("diskPlayerPlaying").setAttribute("class", color);
    if (player === local_player) {
        navigator.vibrate([200, 100, 200]);
        media.play()
    }
}

function colorFromInt(i){
    return i === 1 ? "yellow" : "red";
}


function playAgain(){
    if("resumeGame" == typegame){
        location.href = "../index.html";
    } else {
        location.reload();
    }
}

function exit(){
    document.location.href = "../index.html";
}

function endWithBackend(colorWinner){
    document.getElementById("colorWinner").innerText = (colorWinner === "yellow") ? "jaune": "rouge";
    gameOverPopup.style.display ="";

}

/**
 * Show the pop up of equality
 */

function endEquality(){
    equality.style.display ="";
}

function isCorrect(id){
    let colonne = id[0];
    return board[colonne][5] === 0;
}

function diskPosition(id){
    let colonne = id[0];
    for(let i = 0; i < 6; i++){
        if(board[colonne][i] === 0){
            return [colonne, i]; // id de la place
        }
    }
}

/**
 * Classe permettant de faire un move
 */
class NewMove {
    move = new Array(2);
    constructor(place){
        this.move = place;
    }
}


/**
 * Permet de jouer et appelle le back si le coup est correct
 * @param {*} event
 */
function play(event){
    console.log("play");
    if(event.target.tagName === "TD"){
        const id = event.target.getAttribute('id').split("").map(Number);
        if(isCorrect(id)){
            let place = diskPosition(id);
            let newMove = new NewMove(place);
            console.log(newMove);
            socket.emit('newMove', JSON.stringify(newMove.move));
        }
    }
}
table.addEventListener('click',play);



/* Prévisualisation */

function previsualisation(event){
    let id = event.target.getAttribute('id');
    if(id === "table") { return;}
    id = id.split("").map(Number);
    if(isCorrect(id)){
        let place = diskPosition(id);
        putPrevisualisation(place);
    }

}

function putPrevisualisation(id){
    document.getElementById(placeFromId(id)).setAttribute("class",previsualisationColor);
}

function deletePrevisualisation(event){
    let id = event.target.getAttribute('id');
    if(id === "table") { return;}
    id = id.split("").map(Number);
    if(isCorrect(id)){
        let place = diskPosition(id);
        removePrevisualisation(place);
    }
}

function removePrevisualisation(id){
    document.getElementById(placeFromId(id)).setAttribute("class","empty");
}

function placeFromId(id){
    return "" + id[0] + id[1];
}

/**
 * Save game
 */

function saveGame(){
    let token = localStorage.getItem("access_token");
    let data = {
        UUID: UUID
    }
    fetch(session.url+"/api/games/save", {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                'Token': token
            },
            body: JSON.stringify(UUID)

        }).then(async (response) => {
            let token = await response.text();
            //console.log(token);
            //socket.emit('isSaved', JSON.stringify(UUID));
            location.href = "../index.html";
    });
}

/**
 * Messages
*/

function sendMessage(message){
    let sendMessage = {
        message: message,
        token: localStorage.getItem("access_token")
    }
    socket.emit('newMessage', JSON.stringify(sendMessage));
}

socket.on('ReceiveMessage', ReceiveMessage);

function ReceiveMessage(message){
    // On récupère le nom de l'utilisateur
    let username = localStorage.getItem("username");
    let messageJSON = JSON.parse(message);
    let div = document.createElement("div");

    // On ajoute la classe messageByYou ou messageByOther
    div.setAttribute("class","message " + (messageJSON.user === username ? "messageByYou" : "messageByOther"));

    // On créer la div qui contient le nom de l'utilisateur et la date
    let infoMessage = document.createElement("div");
    infoMessage.setAttribute("class","infoMessage");

    // On créer la div qui contient le nom de l'utilisateur
    let name = document.createElement("div");
    name.setAttribute("class","sender");
    name.innerText = messageJSON.user === username ? "Vous" : messageJSON.user;

    // On ajoute le nom de l'utilisateur à la div
    infoMessage.appendChild(name);

    // On créer la div qui contient la date
    let date = document.createElement("div");
    date.setAttribute("class","date");
    let goodDate = new Date(messageJSON.date);
    let hours = goodDate.getHours() < 10 ? "0" + goodDate.getHours() : goodDate.getHours();
    let minutes = goodDate.getMinutes() < 10 ? "0" + goodDate.getMinutes() : goodDate.getMinutes();
    date.innerText = hours + ":" + minutes;

    // On ajoute la date à la div
    infoMessage.appendChild(date);
    // On ajoute la div qui contient le nom de l'utilisateur et la date à la div principale
    div.appendChild(infoMessage);
    // On créer la div qui contient le message
    let messageDiv = document.createElement("div");
    messageDiv.setAttribute("class","messageContent");
    messageDiv.innerText = messageJSON.message;
    // On ajoute la div qui contient le message à la div principale
    div.appendChild(messageDiv);
    // On ajoute la div principale au chat
    document.getElementById("chatContainer").appendChild(div);
}

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    if (device.platform === "Android" || device.platform === "iOS") {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', 'game.css');
        document.head.appendChild(link);
        document.head.removeChild(document.getElementById("gameBrowser"));
    } else {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', 'gameBrowser.css');
        document.head.appendChild(link);
        console.log("application sur une autre plate-forme");
    }
}