// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.

// test db

const jwt = require('jsonwebtoken');
const { MongoClient } = require("mongodb");
// Replace the uri string with your connection string.
const uri = "mongodb://mongoDb:27017";
const secretCode = "mySecretCode";
const sha256 = require('js-sha256').sha256;
const {UsersManager} = require('./usersManager');



function manageRequest(request, response) {
    addCors(response);
    if (request.method === "OPTIONS") {
        response.end();
        return;
    }
    console.log("Call API to : " + request.url);
    if (request.url === "/api/login/") {
        loginRequest(request, response);
    } else if (request.url === "/api/signup") {
        registerRequest(request, response);
    } else if (request.url === '/api/getToken/') {
       getToken(request,response);
    } else if (request.url === '/api/games/save'){
        saveGame(request,response);
    } else if (request.url === '/api/games_saved/'){
        getGames(request,response);
    }else if(request.url === '/api/askedFriend'){
        addFriend(request,response);
    }else if(request.url === '/api/getuser'){
        getUserInfo(request,response); // On pourra utiliser cette methode pour recuperer les infos d'un user pour les autres
    }else if(request.url === '/api/getUsers'){
        getUsers(request,response);
    }else if(request.url === '/api/acceptFriend'){
        acceptFriend(request,response);
    }else if(request.url === '/api/refuseFriend'){
        refuseFriend(request,response);
    }else if(request.url === '/api/challenges/'){
        getChallenges(request,response);
    }else if(request.url === '/api/getFriends'){
        getFriends(request,response);
    }else if(request.url === '/api/getWaitingFriends'){
        getWaitingFriends(request,response);
    }else if(request.url === '/api/getMessages'){
        getMessageWithFriends(request,response);
    }else if(request.url === '/api/getAchievements'){
        getAchievments(request,response);
    }else if (request.url === '/api/addAchievement/'){
        addAchievement(request,response);
    }else if (request.url === '/api/getStat/'){
        getStat(request,response);
    }else if (request.url === '/api/deleteFriend'){
        deleteFriend(request,response);
    }
    else {
        console.log(request.url);
        response.statusCode = 200;
        response.end(JSON.stringify({message: "Thanks for calling the API!" + request.url}));
    }

}




async function registerRequest(request, response, usersManager) {
    console.log("registerRequest");

    const buffers = [];
    for await (const chunk of request) {
        buffers.push(chunk);
    }
    const data = JSON.parse(Buffer.concat(buffers).toString());

    const values = {
        username: data.username,
        password: sha256(data.password),
        mail: data.mail,
        friendList: [],
        waitingFriendList: [],
        level: 1500,
        statistics: {
            nbGames: 0,
            nbWins: 0,
            nbDefeats: 0,
            nbDraws: 0,
        },
        achievements: [],
    };
    console.log(values);
    // Never store passwords in clear, encrypt them so that no-one can know anyone's password.

    const client = new MongoClient(uri);

    try {
        const database = client.db('test');
        const collection = database.collection('users');

        const query = { username: values.username};
        const user = await collection.findOne(query);
        if(user !== null){
            console.log("The user: " + values.username + " is already register");
            response.statusCode = 400;
            response.end(JSON.stringify({message: "The user already exist"}));
            return;
        }
        //insert users
        await collection.insertOne(values);
        console.log("The user: " + values.username + " is register");
        response.statusCode = 201;
        response.end(jwt.sign({username: values.username}, secretCode));

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }

}



async function loginRequest(request, response) {
    console.log("loginRequest");
    const buffers = [];
    for await (const chunk of request) {
        buffers.push(chunk);
    }
    const data = JSON.parse(Buffer.concat(buffers).toString());
    // Never store passwords in clear, encrypt them so that no-one can know anyone's password.
    data.password = sha256(data.password);
    const client = new MongoClient(uri);
    async function run() {
        try {
            const database = client.db('test');
            const collection = database.collection('users');
            //insert users
            const query = { username: data.username, password: data.password };
            const user = await collection.findOne(query);
            console.log("The user: " + user.username + " is connected");
            response.statusCode = 200;
            response.end(jwt.sign({username: user.username}, secretCode));
        } catch(err){
            let token = null;
            response.end(token);
        }finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    run().catch(console.dir);
}

async function getToken(request,response){
    console.log("getToken");
    let token = request.headers.token;
    if (checkToken(token) !== null && checkToken(token) !== false) {
        let decodedToken = checkToken(token);
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        try {
            await client.connect();
            const database = client.db('test');
            const collection = database.collection('users');
            const query = { username: decodedToken.username};
            const user = await collection.findOne(query);
            response.statusCode = 201;
            console.log("user est " + user.username);
            response.end(JSON.stringify(user));
        } catch(err){
            console.log("l'erreur est " + err);
            response.statusCode = 418;
            response.end("null");
        } finally {
            await client.close();
        }
    }else {
        response.end("null");
        response.statusCode = 418;
    }
}

function checkToken(token){
    console.log("checkToken");
    try {
        return jwt.verify(token, secretCode);
    }catch (err){
        return false;
    }
}
exports.checkToken = checkToken;

async function getUserName(token){
    console.log("getUserName");
    let decodedToken = jwt.verify(token, secretCode);
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    let username = "";
    try {
        await client.connect();
        const database = client.db('test');
        const collection = database.collection('users');
        const query = { username: decodedToken.username};
        const user = await collection.findOne(query);
        username = user.username;
    } catch (e){
        console.log(e);
    }
    return username;
}

async function getGames(request, response){
    console.log("getGames");
    let token = request.headers.token;
    let decodedToken = null;
    try{
        decodedToken = jwt.verify(token, secretCode);
    }catch (err){
        response.statusCode = 418;
        response.end(JSON.stringify(err));
        return;
    }
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    //let username = await getUserName(token);
    try {
        await client.connect();
        const database = client.db('test');
        const collection = database.collection('games');
        const query = { username: decodedToken.username};
        const games = await collection.find(query).toArray();
        response.statusCode = 201;
        response.end(JSON.stringify(games));
    } catch (e){
        console.log(e);
        response.statusCode = 418;
        response.end(JSON.stringify(err));
    }
}

async function getGame(UUID){
    console.log("getGame");
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    let game = null;
    try {
        await client.connect();
        const database = client.db('test');
        const collection = database.collection('games');
        const query = { UUID: UUID};
        game = await collection.findOne(query);
    } catch (e){
        console.log(e);
    }
    return game;
}

async function addFriend(request, response){
    console.log("addFriend");
    let token = request.headers.token;
    let decodedToken = jwt.verify(token, secretCode);
    const buffers = [];
    for await (const chunk of request) {
        buffers.push(chunk);
    }
    const data = JSON.parse(Buffer.concat(buffers).toString());
    const client = new MongoClient(uri);
    try{
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const user = { username: data.friend};
        const updateDoc = { $push: { waitingFriendList: decodedToken.username } };
        await users.updateOne(user, updateDoc);
        response.statusCode = 201;
        console.log("The user: " + data.friend + " has a new friend request");
        if(UsersManager.usersConnected.has(data.friend)){
            UsersManager.usersConnected.get(data.friend).emit("NotificationFriend", {friend: decodedToken.username});
        }
        response.end("Demande d'ami envoyé");
    }catch (e){
        response.statusCode = 418;
        console.log(e);
    } finally {
        await client.close();
    }
}

// Function which accept a friend request
async function acceptFriend(request, response){
    console.log("acceptFriend");
    let token = request.headers.token;
    let decodedToken = jwt.verify(token, secretCode);
    const buffers = [];
    for await (const chunk of request) {
        buffers.push(chunk);
    }
    const data = JSON.parse(Buffer.concat(buffers).toString());
    const ami = data.friend;
    const client = new MongoClient(uri);
    try{
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const user = { username: decodedToken.username};
        const updateDoc = { $pull: { waitingFriendList: ami } };
        await users.updateOne(user, updateDoc);
        const updateDoc2 = { $push: { friendList: ami } };
        await users.updateOne(user, updateDoc2);
        const user2 = { username: ami};
        const updateDoc3 = { $push: { friendList: decodedToken.username } };
        await users.updateOne(user2, updateDoc3);
        response.statusCode = 201;
        response.end("Vous êtes maintenant ami avec " + data.friend);
    }catch (e){
        response.statusCode = 418;
        console.log(e);
    }
}

//function which refuse a friend request
async function refuseFriend(request, response){
    console.log("refuseFriend");
    let token = request.headers.token;
    let decodedToken = jwt.verify(token, secretCode);
    const buffers = [];
    for await (const chunk of request) {
        buffers.push(chunk);
    }
    const data = JSON.parse(Buffer.concat(buffers).toString());
    const client = new MongoClient(uri);
    try{
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const user = { username: decodedToken.username};
        const updateDoc = { $pull: { waitingFriendList: data.friend } };
        await users.updateOne(user, updateDoc);
        response.statusCode = 201;
        response.end("Demande d'ami refusé");
    }catch (e){
        response.statusCode = 418;
        console.log(e);
    }
}


//function which delete a friend from the friend list of the user
async function deleteFriend(request, response){
    console.log("deleteFriend");
    let token = request.headers.token;
    let decodedToken = jwt.verify(token, secretCode);
    const buffers = [];
    for await (const chunk of request) {
        buffers.push(chunk);
    }
    const data = JSON.parse(Buffer.concat(buffers).toString());
    const client = new MongoClient(uri);
    try{
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const user = { username: decodedToken.username};
        const updateDoc = { $pull: { friendList: data.friend } };
        await users.updateOne(user, updateDoc);
        const user2 = { username: data.friend};
        const updateDoc2 = { $pull: { friendList: decodedToken.username } };
        await users.updateOne(user2, updateDoc2)
        response.statusCode = 201;
        response.end("Friend deleted");
    }catch (e){
        response.statusCode = 418;
        console.log(e);
    } finally {
        await client.close();
    }
}

//function which return the user's information
async function getUserInfo(request, response){
    console.log("getUserInfo");
    let token = request.headers.token;
    let user = await getUser(token);
    if(user !== null && user !== undefined){
        response.statusCode = 201;
        response.end(JSON.stringify(user));
    }else{
        response.statusCode = 418;
        response.end("User not found");
    }
}

function checkTokenAndGiveStatusCode(token, response){
    console.log("checkTokenAndGiveStatusCode");
    let decodedToken = null;
    try{
        decodedToken = jwt.verify(token, secretCode);
    }catch (e){
        response.statusCode = 418;
        response.end("Token not valid");
    }
    return decodedToken;
}


async function getUser(token, response){
    console.log("getUser");
    let decodedToken = checkTokenAndGiveStatusCode(token, response);
    if(decodedToken == null){
        console.log("Token not valid in get user    ");
        return null;
    }
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    let user = null;
    try {
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const query = { username: decodedToken.username};
        user = await users.findOne(query);
    } catch (e) {
        console.log(e);
    }finally {
        await client.close();
        return user;
    }
}
exports.getUser = getUser;

/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
** are probably not the ones you will need. */
function addCors(response) {
    // Website you wish to allow to connect to your server.
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow.
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow.
    response.setHeader('Access-Control-Allow-Headers', '*');
    // Set to true if you need the website to include cookies in the requests sent to the API.
    response.setHeader('Access-Control-Allow-Credentials', true);
}


const gameManager = require("../logic/games/gamemanager.js");

async function saveGame(request, response) {
    console.log("saveGame");
    // On recup les données de la réponse
    const buffers = [];

    for await (const chunk of request) {
        buffers.push(chunk);
    }
    const idGame = JSON.parse(Buffer.concat(buffers).toString());
    // Never store passwords in clear, encrypt them so that no-one can know anyone's password.
    let game = gameManager.getGame(idGame);
    let username = await getUserName(request.headers.token);
    const client = new MongoClient(uri);
    try {
        const database = client.db('test');
        const collection = database.collection('games');
        //insert users
        const gameData = {
            username: username,
            UUID: game.UUID,
            board: game.board
        }
        const result = await collection.insertOne(gameData);
        response.statusCode = 201;
        response.end("Ok save");
    } finally {
        // Ensures that the client will close when you finish/error
        gameManager.deleteGame(game.UUID);
        await client.close();
    }

}

//marche pas
async function deleteGameDB(UUIDGame){
    console.log("deleteGameDB");
    // On recup les données de la réponse
    // Never store passwords in clear, encrypt them so that no-one can know anyone's password.
    const client = new MongoClient(uri);
    try {
        const database = client.db('test');
        const collection = database.collection('games');
        //insert users
        const gameData = {
            UUID: UUIDGame,
        }
        const result = await collection.deleteOne(gameData); //db.products.deleteOne({ _id: 1 })
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function updateUser(user){
    console.log("updateUser");
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const _id = { _id: user._id } // specify the document to update using a query
        const query = { $set: { level: user.level } } ;
        let updatedUser = await users.updateOne(_id,query);
    } catch (e){
        console.log(e);
    } finally {
        await client.close();
    }
}
exports.updateUser = updateUser;

async function updateUserGameVictory(user){
    console.log("updateUserGameVictory");
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const _id = { _id: user._id } // specify the document to update using a query
        userse = await users.findOne(_id);
        userse.statistics.nbWins += 1;
        userse.statistics.nbGames += 1;
        const queryUser = { $set: { statistics: userse.statistics } } ;
        // const query = { $set: { statistics:{nbGames:nbGamesPlayed} } };
        // const query2 = { $set: { statistics:{nbWins:nbGamesWin} } };
        // let updatedUser = await users.updateOne(_id,query);
        // let updatedUser2 = await users.updateOne(_id,query2);
        let updatedUser = await users.updateOne(_id,queryUser);
    } catch (e){
        console.log(e);
    } finally {
        await client.close();
    }
}
exports.updateUserGameVictory= updateUserGameVictory;

async function updateUserGameLose(user){
    console.log("updateUserGameLose");
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const _id = { _id: user._id } // specify the document to update using a query
        userse = await users.findOne(_id);
        userse.statistics.nbGames += 1;
        userse.statistics.nbDefeats += 1;
        // const query = { $set: { statistics:{nbGames:nbGames} } };
        // const query2 = { $set: { statistics:{nbDefeats:nbGamesLose} } };
        // let updatedUser = await users.updateOne(_id,query);
        // let updatedUser2 = await users.updateOne(_id,query2);
        const queryUser = { $set: { statistics: userse.statistics } } ;
        let updateUser = await users.updateOne(_id,queryUser);
    } catch (e){
        console.log(e);
    } finally {
        await client.close();
    }
}
exports.updateUserGameLose= updateUserGameLose;

async function updateUserGameDraw(user){
    console.log("updateUserGameDraw");
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const _id = { _id: user._id } // specify the document to update using a query
        userse = await users.findOne(_id);
        userse.statistics.nbGames += 1;
        userse.statistics.nbDraws += 1;
        // const query = { $set: { statistics:{nbGames:nbGames} } };
        // const query2 = { $set: { statistics:{nbDraws:nbGamesDraw} } };
        // let updatedUser = await users.updateOne(_id,query);
        // let updatedUser2 = await users.updateOne(_id,query2);
        const queryUser = { $set: { statistics: userse.statistics } } ;
        let updateUser = await users.updateOne(_id,queryUser);
    } catch (e){
        console.log(e);
    } finally {
        await client.close();
    }
}
exports.updateUserGameDraw= updateUserGameDraw;

async function getFriends(request, response){
    console.log("getFriends");
    let token = request.headers.token;
    let user = await getUser(token, response);
    if(user !== null && user !== undefined){
        response.statusCode = 201;
        let usersName = [];
        for (let i = 0; i < user.friendList.length; i++){
            usersName.push(user.friendList[i]);
        }
        response.end(JSON.stringify(usersName));
    }else{
        response.statusCode = 418;
        response.end("User not found");
    }
}

async function getAchievments(request, response){
    console.log("getAchievments");
    let token = request.headers.token;
    let user = await getUser(token, response);
    if(user !== null && user !== undefined){
        response.statusCode = 201;
        let achievement = [];
        for (let i = 0; i < user.achievements.length; i++){
            achievement.push(user.achievements[i]);
        }
        response.end(JSON.stringify(achievement));
    }else{
        response.statusCode = 418;
        response.end("User not found");
    }
}

async function addAchievement(request, response){
    console.log("addAchievement");
    let token = request.headers.token;
    let decodedToken = jwt.verify(token, secretCode);
    const buffers = [];
    for await (const chunk of request) {
        buffers.push(chunk);
    }
    const data = JSON.parse(Buffer.concat(buffers).toString());
    const client = new MongoClient(uri);
    try{
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');

        const query = { username: decodedToken.username};
        user = await users.findOne(query);
        if (!user.achievements.includes(data.achievement)){
            console.log("le user n'à pas l'achievment");
            const user = { username: decodedToken.username};
            const updateDoc = { $push: { achievements: data.achievement } };
            await users.updateOne(user, updateDoc);
            response.statusCode = 200;
        }
        else{
            console.log("le user à déjà l'achievment");
        }
    }catch (e){
        response.statusCode = 418;
        console.log(e);
    }
}

async function getWaitingFriends(request, response){
    console.log("getWaitingFriends");
    let token = request.headers.token;
    let user = await getUser(token, response);
    if(user !== null && user !== undefined){
        response.statusCode = 201;
        let usersName = [];
        for (let i = 0; i < user.waitingFriendList.length; i++){
            usersName.push(user.waitingFriendList[i]);
        }
        response.end(JSON.stringify(usersName));
    }else{
        response.statusCode = 418;
        response.end("User not found");
    }
}


//get the list of the users in the database
async function getUsers(request, response){
    console.log("getUsers");
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('test');
        const users = database.collection('users');
        const query = {};
        const cursor = users.find(query);
        const usersList = await cursor.toArray();
        response.statusCode = 201;
        // create a list with the username of each user from the usersList
        let usersName = [];
        for (let i = 0; i < usersList.length; i++){
            usersName.push(usersList[i].username);
        }
        response.end(JSON.stringify(usersName));
    } catch (e){
        console.log(e);
        response.statusCode = 418;
        response.end(JSON.stringify(e));
    } finally {
        await client.close();
    }
}
async function saveMessage(message) {
    console.log("saveMessage");
    const client = new MongoClient(uri, {useUnifiedTopology: true});
    try {
        const database = client.db('test');
        const collection = database.collection('messages');
        /*let all = await collection.find({}).toArray();
        console.log(all);
        for (const element of all) {
            console.log(element);
            await collection.deleteOne({_id: element._id});
        }*/

        console.log("connecté")

        let messages = await collection.findOne({users: message.users})

        if (messages) {
            console.log("res : ");
            console.log(messages);
            await collection.updateOne({users: message.users}, {$push: {message: message}});
        } else {
            console.log("pas de message");
            await collection.insertOne({
                users: message.users,
                message: [message]
            });
        }
    } finally {
        await client.close();
    }
}

async function getMessageWithFriends(request, response) {
    console.log("getMessageWithFriends");
    const client = new MongoClient(uri, {useUnifiedTopology: true});
    try {
        const database = client.db('test');
        const collection = database.collection('messages');

        console.log("connecté")
        let users = request.headers.users;
        console.log(users);
        let message = await collection.findOne({users: users})
        console.log("message : ");
        console.log(message);
        if (message) {
            console.log("res : ");
            response.end(JSON.stringify(message.message));
        } else {
            let messages = {
                users: users,
                message: []
            };
            await collection.insertOne({messages});
            console.log("err : ");
            response.end(JSON.stringify(messages.message));
        }
        console.log("fini");
    } catch (e) {
        console.log("y a une putain d'erreur");
        console.log(e);
        response.statusCode = 418;
        response.end(JSON.stringify(e));
    } finally {
        await client.close();
    }
}

async function getChallenges(request, response){
    console.log("getChallenges");
    let token = request.headers.token;
    await getUser(request.headers.token).then(user => {
        let challenges = [];
        for(let challenge of gameManager.waitingRoomFriend){ // liste de room
            if(challenge.waitedPlayer === user.username){
                let challengeData = {
                    nameGame:challenge.name,
                    challenger:challenge.player1.infos.username
                    };
                challenges.push(JSON.stringify(challengeData));
            }
        }
        response.statusCode = 201;
        response.end(JSON.stringify(challenges));
    });
}

async function getStat(request, response){
    console.log("getStat");
    let token = request.headers.token;
    let user = await getUser(token, response);
    if(user !== null && user !== undefined){
        response.statusCode = 201;
        let usersName = [];
        usersName.push(user.statistics.nbWins);
        usersName.push(user.statistics.nbDefeats);
        usersName.push(user.statistics.nbDraws);
        response.end(JSON.stringify(usersName));
    }else{
        response.statusCode = 418;
        response.end("User not found");
    }
}
exports.manage = manageRequest;
exports.getGameSaved = getGame;
exports.deleteGameDB = deleteGameDB;
exports.saveMessage = saveMessage;

