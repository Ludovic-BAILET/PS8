const {Game, Result} = require("./game");
const elo = require("./elo.js");
const apiQuery = require('../../queryManagers/api.js');

class Game1vs1onlineRanked extends Game {
    
    room;

    constructor(room){
        super(room.name, room.player1.socket);
        this.room = room;
        this.playerSockets.add(room.player2.socket);
    }

    startRound(playerMove){
        let playerPlaying = this.player;
        this.play(playerMove);
        if(this.win || this.equality){
            this.updateElo(playerPlaying);
        }
    }

    updateElo(playerPlaying){
        if(this.win && playerPlaying === 0){
            elo.calculateElo(this.room.player1.infos, this.room.player2.infos, 1,0);
            // joueur 1 gagne ? alors on ajoute une victoire au joueur 1 et une défaite au joueur 2
            apiQuery.updateUserGameVictory(this.room.player1.infos);
            apiQuery.updateUserGameLose(this.room.player2.infos);
        } else if(this.win && playerPlaying === 1){
            apiQuery.updateUserGameVictory(this.room.player2.infos);
            apiQuery.updateUserGameLose(this.room.player1.infos);
            elo.calculateElo(this.room.player1.infos, this.room.player2.infos, 0,1);
        } else if(this.equality){
            apiQuery.updateUserGameDraw(this.room.player1.infos);
            apiQuery.updateUserGameDraw(this.room.player2.infos);
            elo.calculateElo(this.room.player1.infos, this.room.player2.infos, 0.5,0.5);
        }
        apiQuery.updateUser(this.room.player1.infos);
        apiQuery.updateUser(this.room.player2.infos);
    }

    goodPlayerIsPlaying(playerSocket){
        return playerSocket === Array.from(this.playerSockets)[this.player];
    }

    playerDisconnected(playerSocket){
        if(this.win || this.equality){ return;}
        if(this.room.player1.socket === playerSocket){
            this.room.player2.socket.emit('updatedBoard', JSON.stringify(new Result(this.board, true, false, "red",1 )));
        } else if(this.room.player2.socket === playerSocket){
            this.room.player1.socket.emit('updatedBoard', JSON.stringify(new Result(this.board, true, false, "yellow",0 )));
        }
    }
}

module.exports = Game1vs1onlineRanked;