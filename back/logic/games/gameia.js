const {Game} = require("./game");
const ia = require("../ai");

class GameIA extends Game{

    constructor(UUID, playerSocket, id){
        super(UUID, playerSocket);
        this.player = id === 1 ? 1 : 0;
        this.js_color = (this.player === 0)? 1 : 2;

    }

    startRound(playerMove){
        //Le joueur joue
        this.play(playerMove);
        // L'IA joue
        // let IAMove = ia.computeMove(this); // old version
        /* version asynchrone *//*
        await ia.nextMove(playerMove).then(IAMove => {
            this.play(IAMove);
        });
        /* version synchrone */
        if(this.win || this.equality) return; //éviter de faire jouer l'IA si le joueur a gagné ou fait égalité
        let IAMove = ia.computeMove(this.board,this.js_color); // new version
        this.play(IAMove);
    }
}

module.exports = GameIA;
