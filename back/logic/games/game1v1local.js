const {Game} = require("./game");

class Game1vs1Local extends Game {

  constructor(UUID, playerSocket){
    super(UUID, playerSocket);
  }

  startRound(playerMove){
    this.play(playerMove);
  }
}

module.exports = Game1vs1Local;
