// The http module contains methods to handle http queries.
const http = require('http')
// Let's import our logic.
const fileQuery = require('./queryManagers/front.js')
const apiQuery = require('./queryManagers/api.js')


/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */
let server = http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function(elem) {
        return elem !== "..";
    });

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            apiQuery.manage(request, response);
            // If it doesn't start by /api, then it's a request for a file.
        } else {
            fileQuery.manage(request, response);
        }
    } catch(error) {
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }
// For the server to be listening to request, it needs a port, which is set thanks to the listen function.
});
const { Server } = require("socket.io");

const io = new Server(server, {cors: {origin: "*", methods: ["GET", "POST"]}});
/*
defineSocketMethods(io);
*/
const gameManager = require("./logic/games/gamemanager.js");
const { getGameSaved } = require("./queryManagers/api.js");
const {UsersManager} = require("./queryManagers/usersManager.js");
gameManager.userManager = UsersManager;
const jwt = require("jsonwebtoken");


io.on('connection', (socket) => {
    let idGame;
    console.log('a user connected');

    let token = socket.handshake.query.token;
    try {
        let decodedToken = jwt.verify(token, "mySecretCode");
        console.log('username : ' + decodedToken.username);

        UsersManager.addConnectedUser(decodedToken.username, socket);
    }catch (e) {
        console.log("token invalide 1");
    }

    socket.on('AIplays', (msg) => {
        idGame = gameManager.newGameIA(socket, msg);
        sendIdGame(socket, idGame);
    });
    socket.on('1vs1LocalPlays', (msg) => {
        idGame = gameManager.newGame1vs1local(socket);
        sendIdGame(socket, idGame);
    });

    socket.on('OnlineRandomPlays', (msg) => {
        let token = JSON.parse(msg);
        idGame = gameManager.newGame1vs1onlineRandom(socket,io, token);
        sendIdGame(socket, idGame);
    });

    socket.on('OnlineRanked', (msg) => {
        let token = JSON.parse(msg);
        idGame = gameManager.newGame1vs1onlineRanked(socket,io, token);
        sendIdGame(socket, idGame);
    });

    socket.on('newMove', function (message){
        console.log("newMove");
        let haveNextRoud = gameManager.nextRound(socket, JSON.parse(message), io);
        if(haveNextRoud){
            apiQuery.deleteGameDB(idGame);
        }
    });
    socket.on('resumeGame', async function (gameInfo){
        let game = JSON.parse(gameInfo);
        let gameSaved = await getGameSaved(game.UUID);
        idGame = gameSaved.UUID;
        gameManager.resumeGame(socket, gameSaved);
        sendIdGame(socket, gameSaved.UUID);
    });

    socket.on('disconnect', function (message){
        console.log("disconnect");
        gameManager.playerDisconnected(socket, io);
        try {
            let decodedToken = jwt.verify(token, "mySecretCode");
            console.log(decodedToken.username);

            UsersManager.removeConnectedUser(decodedToken.username);
        }catch (e) {
            console.log("token invalide 2");
        }
    });

    socket.on('isSaved', function (message){
        let UUID = JSON.parse(message);
        console.log(UUID)
        gameManager.setGameSaved(UUID);
    });

    socket.on('newMessage', function (message){
        let msg = JSON.parse(message);
        gameManager.newMessage(socket, msg, io).then();
    });

    socket.on('newMessageForFriend', function (message){
        console.log("newMessageForFriend");
        let msg = JSON.parse(message);
        UsersManager.newMessage(socket, msg, io).then();
    });

    socket.on('challenge', function (message){
        let msg = JSON.parse(message);
        gameManager.newChallenge(socket, msg);
    });

    socket.on('acceptChallenge', async function (message){
        let msg = JSON.parse(message);
        console.log("accept challenge");
        gameManager.acceptChallenge(socket, msg, io);
    });
});

function sendIdGame(socket, idGame){
    socket.emit('idGame', JSON.stringify(idGame));
}

server.listen(8000);
