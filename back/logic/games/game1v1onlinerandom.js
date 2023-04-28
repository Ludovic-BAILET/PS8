const {Game, Result} = require("./game");

class Game1vs1onlineRandom extends Game {

    constructor(room){
        super(room.name, room.player1.socket);
        this.room = room;
        this.playerSockets.add(room.player2.socket);
    }

    startRound(playerMove){
        this.play(playerMove);
    }

    goodPlayerIsPlaying(playersocket){
        return playersocket === Array.from(this.playerSockets)[this.player];
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

module.exports = Game1vs1onlineRandom;
