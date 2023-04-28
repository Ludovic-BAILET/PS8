const ia = require("../ai");
const {Result} = require("./game");
const Game1vs1Local = require("./game1v1local");
const Game1vs1onlineRandom = require("./game1v1onlinerandom");
const GameIA = require("./gameia");
const GameOnlineRanked = require("./gameOnlineRanked");
const { getUser } = require("../../queryManagers/api.js");
const apiQuery = require('../../queryManagers/api.js');

class GameManager {
  userManager;

  games = new Set();
  defaultRoom = "room";
  idRoom = 0;
  waitingRoom = new Set();
  waitingRoomRanked = new Set();
  waitingRoomFriend = new Set();
  friendGames = new Set();
  constructor(){
  }

  newGameIA(socket, starter){
    let n = JSON.parse(starter);
    let id = this.newIdRoom();
    let game = new GameIA(id, socket, n);
    this.games.add(game);
    socket.join(id);
    if(n === 1){
      /* version asynchrone *//*
            ia.setup(1);
            await ia.nextMove([]).then(IAMove => {
                game.play(IAMove);
                socket.emit('updatedBoard', JSON.stringify(new Result(game.board, game.win, game.equality, game.colorWin, game.player)));
            });
            /* version synchrone */

      let IAMove = ia.computeMove(game.board, game.js_color);
      game.play(IAMove);
      socket.emit('updatedBoard', JSON.stringify(new Result(game.board, game.win, game.equality, game.colorWin, game.player)));
    } else {
      ia.setup(2);
    }
    return id;
  }

  newGame1vs1local(socket){
    let id = this.newIdRoom();
    this.games.add(new Game1vs1Local(id, socket));
    socket.join(id);
    return id;
  }

  newGame1vs1onlineRandom(socket, io, token){
    if(token === undefined){
      socket.emit("redirect", "/login");
      return;
    }if (apiQuery.checkToken(token) === false){
      socket.emit("redirect", "/login");
      return;
    }
    let user = apiQuery.getUser(token);
    user.then((user) => {
      if(user === undefined){
        return;
      }
      this.joinGameRandom(socket,user, io);
    });
  }

  joinGameRandom(socket, user, io){
    if(this.waitingRoom.size > 0){
      let room = this.waitingRoom.values().next().value;
      let player2 = new Player(socket, user);
      room.setPlayer2(player2);
      socket.join(room.name);
      socket.emit('initialColor', JSON.stringify(1));
      io.to(room.name).emit('ready',"");
      this.waitingRoom.delete(room);
      this.games.add(new Game1vs1onlineRandom(room));
      return room.name;
    } else {
      let id = this.newIdRoom();
      let player = new Player(socket, user);
      this.waitingRoom.add(new Room(id, player));
      socket.join(id);
      socket.emit('initialColor', JSON.stringify(0));
      socket.emit('wainting');
    }
  }

  newGame1vs1onlineRanked(socket, io, token){
    if(token === undefined){
      return location.href = "/login";
    }if (apiQuery.checkToken(token) === false){
      socket.emit("redirect", "/login");
      return;
    }
    let user = apiQuery.getUser(token);
    user.then((user) => {
      if(user === undefined){
        socket.emit("redirect", "/login");
        return;
      }
      this.joinGameRanked(socket,user, io);
    });
  }

  joinGameRanked(socket,user, io){
    let maxDif = 10;
    while (maxDif<=200) {
      for(let room of this.waitingRoomRanked){
        if(Math.abs(room.player1.infos.level - user.level) < maxDif){
          let player2 = new Player(socket, user);
          room.setPlayer2(player2);
          socket.join(room.name);
          socket.emit('initialColor', JSON.stringify(1));
          io.to(room.name).emit('ready',"");
          this.waitingRoomRanked.delete(room);
          this.games.add(new GameOnlineRanked(room));
          return room.name;
        }
      }
      maxDif += 10;
    }
    this.createNewRankedRoom(socket,user);
  }

  createNewRankedRoom(socket,user) {
    let id = this.newIdRoom();
    let player = new Player(socket, user);
    this.waitingRoomRanked.add(new Room(id,player));
    socket.join(id);
    socket.emit('initialColor', JSON.stringify(0));
    socket.emit('wainting');
  }

  newIdRoom(){
    return this.defaultRoom + this.generateUUID(); //this.idRoom++;
  }

  generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if(d > 0){//Use timestamp until depleted
        r = (d + r)%16 | 0;
        d = Math.floor(d/16);
      } else {//Use microseconds since page-load if supported
        r = (d2 + r)%16 | 0;
        d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  nextRound(socket, coup, io){
    let game =  [...this.games].find( x => {
      return x.playerSockets.has(socket);
    });
    if(game === undefined){return;}
    if(!game.goodPlayerIsPlaying(socket)){
      console.log("mauvais joueur");
      return  ;
    }
    /*
    try {
        game.startRound(coup).then(() => socket.emit('updatedBoard', JSON.stringify(new Result(game.board, game.win, game.equality,game.colorWin, game.player))));
    }catch (e) {
        socket.emit('updatedBoard', JSON.stringify(new Result(game.board, game.win, game.equality,game.colorWin, game.player)));
    }
    //this.deleteGame(game.name);*/
    /* synchrone */
    game.startRound(coup);
    /*
    for(let playerSocket in game.playerSockets){
        console.log("emit");
        playerSocket.emit('updatedBoard', JSON.stringify(new Result(game.board, game.win, game.equality,game.colorWin, game.player)));
    };*/
    io.to(game.UUID).emit('updatedBoard', JSON.stringify(new Result(game.board, game.win, game.equality,game.colorWin, game.player)));
    return game.win || game.equality;
  }

  getGame(idGame){
    for(let game of this.games){
      if(game.UUID == idGame){
        return game;
      }
    }
    return null;
  }

  deleteGame(UUID){
    for(let game of this.games){
      if(game.UUID == UUID){
        this.games.delete(game);
      }
    }
  }

  resumeGame(socket, gameSaved){
    let resumeGame = new GameIA(gameSaved.UUID, socket);
    this.games.add(resumeGame);
    resumeGame.board = gameSaved.board;
    socket.join(gameSaved.UUID);
    socket.emit('setBoard', JSON.stringify(new Result(resumeGame.board, resumeGame.win, resumeGame.equality,resumeGame.colorWin, resumeGame.player)));
  }

  setGameSaved(UUID){
    let game =  [...this.games].find( x => {
      return x.UUID == UUID;
    });
    game.isSaved = true;
  }

  playerDisconnected(socket, io){
    // on supprime le joueur des parties
    for(let game of this.games){
      if(game.playerSockets.has(socket)){
        game.playerDisconnected(socket);
        if(!game.isSaved){
          this.deleteGame(game.UUID);
        }
      }
    }

    // on supprime le joueur de la liste d'attente
    for(let waintingRoom of this.waitingRoom){
      if(waintingRoom.player1.socket === socket){
        this.waitingRoom.delete(waintingRoom);
      }
    }

    for(let waintingRoom of this.waitingRoomRanked){
      if(waintingRoom.player1.socket === socket){
        this.waitingRoomRanked.delete(waintingRoom);
      }
    }

    /* On supprime les challenges */
    for(let waintingRoom of this.waitingRoomFriend){
      if(waintingRoom.player1.socket === socket){
        this.waitingRoomFriend.delete(waintingRoom);
      }
      if(this.userManager.usersConnected.has(waintingRoom.waitedPlayer) && waintingRoom.player1.socket === socket){
        let friendSocket = this.userManager.usersConnected.get(waintingRoom.waitedPlayer);
        friendSocket.emit('updateChallenges',"");
        this.cancelChallenge(friendSocket);
      }
    }
  }

  cancelChallenge(socket){
    socket.emit('NotificationCancelChallenge',"");
  }


  /* Challenge */

  async newMessage(socket, msg, io){
    let game =  [...this.games].find( x => {
      return x.playerSockets.has(socket);
    });
    if(game === undefined){return;}
    apiQuery.getUser(msg.token).then(user => {
      game.newMessage(user,msg.message,io);
    });
  }

  newChallenge(socket, msg){
    let token = msg.token;
    if(token === undefined){
      socket.emit("redirect", "/login");
      return;
    }if (apiQuery.checkToken(token) === false){
      socket.emit("redirect", "/login");
      return;
    }
    let user = apiQuery.getUser(token);
    user.then((user) => {
      if(user === undefined){
        return;
      }
      this.createFriendGame(socket,user,msg.challenged);
    });
  }

  createFriendGame(socket, user, friend){
      let id = this.newIdRoom();
      let player1Socket = this.userManager.usersConnected.get(user.username);
      let player = new Player(player1Socket, user);
      let room = new Room(id, player);
      room.setWaitedPlayer(friend);
      this.waitingRoomFriend.add(room);
      socket.join(id);
      socket.emit('initialColor', JSON.stringify(0));
      socket.emit('wainting');
      if(this.userManager.usersConnected.has(friend)){
        let friendSocket = this.userManager.usersConnected.get(friend);
        friendSocket.emit('NotificationChallenge', JSON.stringify(id)); //pour les notifications
        friendSocket.emit('updateChallenges',"");
      }
  }

  acceptChallenge(socket, msg, io){
    let id = msg.UUID;
    let room = [...this.waitingRoomFriend].find( x => {
      return x.name == id;
    });
    if(room === undefined){
      return;
    }
    let player1Socket = this.userManager.usersConnected.get(room.player1.infos.username);
    let player2 = new Player(socket, room.player1.infos);
    room.player1.socket = player1Socket;
    room.setPlayer2(player2);
    let game = new Game1vs1onlineRandom(room);
    this.games.add(game);
    player1Socket.join(room.name);
    socket.join(room.name);
    socket.emit('initialColor', JSON.stringify(1));
    io.to(room.name).emit('ready',"");
    this.waitingRoomFriend.delete(room);
  }

  /************************************/
}

class Room {
  name;
  player1; //user object
  player2; //user object
  waitedPlayer; //username
  constructor(name, player1){
    this.name = name;
    this.player1 = player1;
  }

  setPlayer2(player2){
    this.player2 = player2;
  }

  setWaitedPlayer(waitedPlayer){
    this.waitedPlayer = waitedPlayer;
  }
}

class Player {
  socket;
  infos;
  constructor(socket, infos){
    this.socket = socket;
    this.infos = infos;
  }
}

exports.GameManager = GameManager;
module.exports = new GameManager();
