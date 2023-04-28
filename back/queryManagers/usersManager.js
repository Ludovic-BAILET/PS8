const { MongoClient } = require("mongodb");
const apiQuery = require("./api.js");
// Replace the uri string with your connection string.
const uri = "mongodb://mongoDb:27017";

class UsersManager {

  constructor(){
    this.usersConnected = new Map();
    this.usersDisconnected = new Set();
    this.init().then(r => {
      console.log("init user manager");
      console.log(this.usersDisconnected);
      console.log(this.usersConnected.size);
    });
  }

  async init(){
    // on récupère la liste des users dans la base de données et on les ajoute dans la map des users déconnectés
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      const database = client.db('test');
      const users = database.collection('users');
      const query = {};
      const cursor = users.find(query);
      const usersList = await cursor.toArray();
      // create a list with the username of each user from the usersList
      for (let i = 0; i < usersList.length; i++){
        this.usersDisconnected.add(usersList[i].username);
      }
    }catch (e){
      console.log(e);
    } finally {
      await client.close();
    }
  }

  addConnectedUser(user, socket){
    this.usersDisconnected.delete(user);
    this.usersConnected.set(user, socket);
    console.log(this.usersDisconnected);
    console.log(this.usersConnected.size);
  }

  removeConnectedUser(user){
    this.usersConnected.delete(user);
    this.usersDisconnected.add(user);
    console.log(this.usersDisconnected);
    console.log(this.usersConnected.size);
  }

  addDisconnectedUser(user){
    this.usersDisconnected.add(user);
  }

  async newMessage(socket, msg, io) {
    let onlineFriend =  this.usersConnected.get(msg.friend);
    let offlineFriend = this.usersDisconnected.has(msg.friend);

    if (onlineFriend === undefined && offlineFriend === false) {
      console.log("friend not found");
      return;
    }

    let now = Date.now();
    let users = (msg.username < msg.friend) ? msg.username + "_" + msg.friend : msg.friend + "_" + msg.username;
    let message = {
      user: msg.username,
      to: msg.friend,
      users: users,
      message: msg.message,
      date : now
    }

    console.log("on sauvegarde le message : " + message);
    await apiQuery.saveMessage(message);

    // On envoie le message à l'utilisateur

    socket.emit("ReceiveMessageForFriend", JSON.stringify(message));

    if (onlineFriend) {
      console.log("friend is online");
      // On envoie le message à l'ami
      onlineFriend.emit("ReceiveMessageForFriend", JSON.stringify(message));
    }
  }
}

exports.UsersManager = new UsersManager();
