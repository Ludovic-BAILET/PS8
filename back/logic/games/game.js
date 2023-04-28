const checks = require("../checks.js");
const { deleteGameDB } = require("../../queryManagers/api.js");

class Game {
    //Identification de la game
    UUID;
    board;
    isSaved = false;
    //socket du joueur
    playerSockets = new Set();

    //Element permettant le déroulement de la game
    player = 0;
    color = "yellow";
    js_color = 1;
    id = 2; // id = 2 si le joueur commence, id = 1 si l'IA commence
    win = false;
    equality = false;
    colorWin = null;


    constructor(UUID, playerSocket){
        this.UUID = UUID;
        this.playerSockets.add(playerSocket);
        this.initBoard();
    }

    /**
     * Création du board
     */
    initBoard(){
        this.board = new Array(7);
        for (let i = 0; i < 7; i++)
        {
            this.board[i] = new Array(6);
            for (let j = 0; j < 6; j++){
                this.board[i][j] = 0;

            }
        }
    }

    /**
     * Vérifie si le coup est correct
     * @param {*} move
     * @returns
     */
    isCorrect(move){
        let colonne = move[0];

        return this.board[colonne][5] === 0;
    }

    diskPosition(move){
        let colonne = move[0];
        for(let line = 0; line <= 5; line++){
            if(this.board[colonne][line] === 0){
                return [colonne, line]; // id de la place
            }
        }
    }

    nextPlayer(){
        this.player = (this.player + 1) % 2;
        this.color = (this.player === 0) ? "yellow" : "red";
        this.js_color = (this.player === 0)? 1 : 2;
    }

    putDisk(place){
        this.board[place[0]][place[1]] = this.js_color;
    }

    play(move){
        if(this.isCorrect(move)){
            let place = this.diskPosition(move);
            this.putDisk(place);
            if(checks.checkVictory(this.board,place,this.js_color)){
                this.win =true;
                this.colorWin = this.color;
            }
            if(checks.checkEquality(this.board)){
                this.equality = true;
            }
            this.nextPlayer();
        }
    }

    startRound(){}

    goodPlayerIsPlaying(playerSocket){
        return true;
    }

    playerDisconnected(playerSocket){}

    newMessage(user,msg,io){
        let now = Date.now();
        // Récupérez l'heure, les minutes et les secondes de l'objet Date
        let sendMessage = {
            user: user.username,
            message: msg,
            date : now
        }
        io.to(this.UUID).emit("ReceiveMessage", JSON.stringify(sendMessage));
    }
}

class Result {
    board;
    win;
    equality;
    colorWinner;
    player;
    constructor(board, win =false,equality=false, color=null, player=0){
        this.board = board;
        this.win = win;
        this.equality = equality;
        this.colorWinner = color;
        this.player = player;
    }
}

module.exports = {Game, Result};
