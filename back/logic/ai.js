const child_process = require("child_process");
const { resolve } = require("path");

function computeMoveRandom(gameState) {
    while(true) {
        // Get a random column (integer between 0 and 6)
        let i = Math.floor(Math.random() * 7); // attention de base c'est *7
        for (let j = 0 ; j <= 5 ; j++) { // attention de base c'est <=5
            if (gameState.board[i][j] === 0) { //atention de base c'est i j
                return [i, j];
            }
        }
    }
}
exports.computeMoveRamdom = computeMoveRandom;
exports.getValueBoard = getValueBoard;



/// TEST IA

function getValueBoard(color, gameState) {
    let places = getPlaces(color, gameState);
    let value = 0;
    for (let i = 0; i < places.length; i++) {
        value += getValue(places[i],gameState);
    }
    return value;
}

function getValue(pLace, gameState) {
    let value = 0;
    // console.log(pLace);
    value += getValueHorizontal(pLace,gameState);
    value += getValueVertical(pLace,gameState);
    value += getValueDiagonal(pLace,gameState);
    return value;
}

/**
 * **************************************** Diagonals ****************************************
 */
function getValueDiagonal(pLace, gameState) {
    let value = 0;
    let valueTopLeftBottomRigh = 0;
    let valueTopRightBottomLeft = 0;
    if (possibleTopLeftBottomRight(pLace,gameState) && possibleTopRightBottomLeft(pLace,gameState)) {
        valueTopLeftBottomRigh = getValueTopLeftBottomRight(pLace,gameState);
        valueTopRightBottomLeft = getValueTopRightBottomLeft(pLace,gameState);
    } else if (possibleTopLeftBottomRight(pLace,gameState)) {
        valueTopLeftBottomRigh = getValueTopLeftBottomRight(pLace,gameState);
    } else if (possibleTopRightBottomLeft(pLace,gameState)) {
        valueTopRightBottomLeft = getValueTopRightBottomLeft(pLace,gameState);
    }
    value = valueTopLeftBottomRigh + valueTopRightBottomLeft;
    if(valueTopLeftBottomRigh >= 4 || valueTopRightBottomLeft >= 4){
        return value *10;
    }
    return value;
}

function possibleTopRightBottomLeft(pLace,gameState) {
    let cumul = 1;
    for (let i = 1; i < 4; i++) {
        if (pLace.x + i < 7 && pLace.y + i < 6) {
            if (gameState[pLace.x + i][pLace.y + i] === pLace.value || gameState[pLace.x + i][pLace.y + i] === 0) {
                cumul++;
            } else {
                break;
            }
        }
    }
    for (let i = 1; i < 4; i++) {
        if (pLace.x - i >= 0 && pLace.y - i >= 0) {
            if (gameState[pLace.x - i][pLace.y - i] === pLace.value || gameState[pLace.x - i][pLace.y - i] === 0) {
                cumul++;
            }
        }
    }
    return cumul >= 4;
}

function possibleTopLeftBottomRight(pLace,gameState) {
    let cumul = 1;
    for (let i = 1; i < 4; i++) {
        if (pLace.x + i < 7 && pLace.y - i >= 0) {
            if (gameState[pLace.x + i][pLace.y - i] === pLace.value || gameState[pLace.x + i][pLace.y - i] === 0) {
                cumul++;
            } else {
                break;
            }
        }
    }
    for (let i = 1; i < 4; i++) {
        if (pLace.x - i >= 0 && pLace.y + i < 6) {
            if (gameState[pLace.x - i][pLace.y + i] === pLace.value || gameState[pLace.x - i][pLace.y + i] === 0) {
                cumul++;
            } else {
                break;
            }
        }
    }
    return cumul >= 4;
}

function getValueTopRightBottomLeft(pLace,gameState) {
    let col = pLace.x;
    let line = pLace.y;
    let value = 1;
    let opponentRight = false;
    let opponentLeft = false;
    for (let i = 1; i < 4; i++) {
        if (col + i < 7 && line + i < 6) {
            if (gameState[col + i][line + i] === pLace.value) {
                value++;
            } else if (gameState[col + i][line + i] !== 0) {
                opponentRight = true;
                break;
            } else {
                break;
            }
        }
    }
    for (let i = 1; i < 4; i++) {
        if (col - i >= 0 && line - i >= 0) {
            if (gameState[col - i][line - i] === pLace.value) {
                value++;
            } else if (gameState[col - i][line - i] !== 0) {
                opponentLeft = true;
                break;
            } else {
                break;
            }
        }
    }
    if (opponentLeft && opponentRight) {
        return 0;
    }
    return value;
}


function getValueTopLeftBottomRight(pLace,gameState) {
    let col = pLace.x;
    let line = pLace.y;
    let value = 1;
    let opponentRight = false;
    let opponentLeft = false;
    for (let i = 1; i < 4; i++) {
        if (col + i < 7 && line - i >= 0) {
            if (gameState[col + i][line - i] === pLace.value) {
                value++;
            } else if (gameState[col + i][line - i] !== 0) {
                opponentRight = true;
                break;
            } else {
                break;
            }
        }
    }
    for (let i = 1; i < 4; i++) {
        if (col - i >= 0 && line + i < 6) {
            if (gameState[col - i][line + i] === pLace.value) {
                value++;
            } else if (gameState[col - i][line + i] !== 0) {
                opponentLeft = true;
                break;
            } else {
                break;
            }
        }
    }
    if (opponentLeft && opponentRight) {
        return 0;
    }
    return value;
}
/**

 **************************************** Vertical ****************************************
 */

function getValueVertical(pLace,gameState) {
    let value = 0;
    if (possibleVertical(pLace,gameState)) {
        value = calculValueVertical(pLace,gameState);
    }
    return value >= 4 ? value *10 : value;
}

function possibleVertical(pLace,gameState) {
    let cumul = 1;
//check top
    for (let i = 1; i < 4; i++) {
        if (pLace.y + i < 6) {
            if (
                gameState[pLace.x][pLace.y + i] === pLace.value ||
                gameState[pLace.x][pLace.y + i] === 0
            ) {
                cumul++;
            } else {
                break;
            }
        }
    }
//check bottom
    for (let i = 1; i < 4; i++) {
        if (pLace.y - i >= 0) {
            if (
                gameState[pLace.x][pLace.y - i] === pLace.value ||
                gameState[pLace.x][pLace.y - i] === 0
            ) {
                cumul++;
            } else {
                break;
            }
        }
    }
    return cumul >= 4;
}

function calculValueVertical(pLace,gameState) {
    let col = pLace.x;
    let line = pLace.y;
    let value = 1;
    let opponentRight = false;
    let opponentLeft = false;
//right
    for (let i = line + 1; i < 6; i++) {
        if (gameState[col][i] === pLace.value) {
            value++;
        } else if (gameState[col][i] !== 0) {
            opponentRight = true;
            break;
        } else {
            break;
        }
    }
//left
    for (let i = line - 1; i >= 0; i--) {
        if (gameState[col][i] === pLace.value) {
            value++;
        } else if (gameState[col][i] !== 0) {
            opponentLeft = true;
            break;
        } else {
            break;
        }
    }
    if (opponentLeft && opponentRight) {
        return 0;
    }
    return value;
}

/**

 **************************************** Horizontal ****************************************
 */

function getValueHorizontal(pLace,gameState) {
    let value = 0;
    if(possibleHorizontal(pLace,gameState)){
        value =  calculValueHorizontal(pLace,gameState);
    }
    return value >= 4 ? value *10 : value;
}

function possibleHorizontal(pLace,gameState) {
    let cumul = 1;
// vérifie à droite
    for (let i = 1; i < 4; i++) {
        if(pLace.x+i < 7){
            if(gameState[pLace.x+i][pLace.y] === pLace.value || gameState[pLace.x+i][pLace.y] === 0){
                cumul++;
            } else {
                break;
            }
        }
    }
// vérifie à gauche
    for (let i = 1; i < 4; i++) {
        if(pLace.x-i >= 0){
            if(gameState[pLace.x-i][pLace.y] === pLace.value || gameState[pLace.x-i][pLace.y] === 0){
                cumul++;
            } else {
                break;
            }
        }
    }
    return cumul >= 4;
}

function calculValueHorizontal(pLace,gameState) {
    let col = pLace.x;
    let line = pLace.y;
    let value = 1;
    let opponentRight = false;
    let opponentLeft = false;
// à droite
    for(let i = col+1; i < 7; i++){
        if(gameState[i][line] === pLace.value){
            value++;
        } else if (gameState[i][line] !== 0){
            opponentRight = true;
            break;
        } else {
            break;
        }
    }
// à gauche
    for(let i = col-1; i >=0; i--){
        if(gameState[i][line] === pLace.value){
            value++;
        } else if (gameState[i][line] !== 0){
            opponentLeft = true;
            break;
        } else {
            break;
        }
    }
    if(opponentLeft && opponentRight ){
        return 0;
    }
    return value;
}

function getPlaces(color, gameBoard) {
    let places = [];
    for (let i = 0; i <7; i++) {
        for (let j = 0; j < 6; j++) {
            if(gameBoard[i][j] === 0){
                break;
            }
            if(gameBoard[i][j] === color) {
                places.push(new Place(i, j, gameBoard[i][j]));
            }
        }
    }
    return places;
}

function showBoard(gameBoard) {
    for (let i = 5; i >= 0; i--) {
        let row = '';
        for (let j = 0; j < 7; j++) {
            row += gameBoard.board[j][i] + ' ';
        }
    }
}

function tryBoardColonne(gameBoard, color,colonne) {
    let gameBoard2 = [].concat(gameBoard);
        for(let j = 0; j < 6; j++){
            if(gameBoard2[colonne][j] === 0){
                gameBoard2[colonne][j] = color;
                let values = getValueBoard(color, gameBoard2);
                gameBoard2[colonne][j] = 0;
                return values;
            }
    }
}

exports.tryBoardColonne = tryBoardColonne;


function computeMove2(gameBoard,color) {
    let indiceColonne = Math.floor(Math.random() * 7);
    do{
        indiceColonne = Math.floor(Math.random() * 7);
    }while (gameBoard[indiceColonne][5] !== 0);
    let max = tryBoardColonne(gameBoard, color, indiceColonne);
    for(let i = 0; i < 7; i++){
        let a = tryBoardColonne(gameBoard, color, i);
        if(a === max && gameBoard[i][5] === 0){
            if(gameBoard[i][0] === 0){
                max = a;
                indiceColonne = i;
            }
        }else if (a > max && gameBoard[i][5] === 0){
            max = a;
            indiceColonne = i;
        }
    }
    if(gameBoard[indiceColonne][5] === 0){
        return [indiceColonne,0];
    }
    return computeMoveRandom(gameBoard); // Si on trouve rien, on joue au pif
}

exports.computeMove2 = computeMove2;

function contre(gameBoard, color) {
    let colorAdverse = color === 1 ? 2 : 1;
    for(let i = 0; i < 7; i++){
        if(getValueBoard(colorAdverse, gameBoard) + 50  < tryBoardColonne(gameBoard, colorAdverse, i)){
            let move = computeMove2(gameBoard, colorAdverse);
            return goodLine(gameBoard,move);
        }
    }
    let move = computeMove2(gameBoard, colorAdverse);
    return goodLine(gameBoard,move);
}

function goodLine(gameBoard,move){
    let colonne = move[0];
    for (let i = 0; i < 6; i++) {
        if(gameBoard[colonne][i] === 0){
            return [colonne,i];
        }
    }
}

function tryToWin(gameBoard, color){
    for(let i = 0; i < 7; i++){
        if(getValueBoard(color, gameBoard) + 50  < tryBoardColonne(gameBoard, color, i)){
            let move = [i,0];
            return goodLine(gameBoard,move);
        }
    }
    return null;
}


function tryToContre(gameBoard, color){
    let colorAdverse = color == 1 ? 2 : 1;
    for(let i = 0; i < 7; i++){
        if(getValueBoard(colorAdverse, gameBoard) + 50  < tryBoardColonne(gameBoard, colorAdverse, i)){
            let move = [i,0];
            return goodLine(gameBoard,move);
        }
    }
    return avoidToBeBlocked(gameBoard, color);
}

function getPossibleMoves(gameBoard){
    moves = [];
    for(let i= 0; i<7; i++ ){
        for(let j=0; j<6; j++){
            if(gameBoard[i][j] === 0){
                moves.push(new Place(i,j,0));
                break;
            }
        }
    }
    return moves;
}

function twoAlignHonrizontal(place, gameBoard, color, moves){
    let col = place.x;
    let line = place.y;
    // left
    let cumul = 1;
    let possibleLeft = false;
    let possibleRight = false;
    let colResult1;
    let colResult2;
    if(col-1 >= 0){
        if(gameBoard[col-1][line] == color){
            cumul++;
            if(col-2 >= 0){
                if(gameBoard[col-2][line] == 0){
                    colResult1 = col-2;
                    possibleLeft= true;
                }
            }
        }
        if(gameBoard[col-1][line] == 0){
            colResult1 = col-1;
            possibleLeft = true;
        }
    }
    //right
    if(col+1 <=6){
        if(gameBoard[col+1][line] == color){
            cumul++;
            if(col+2 <=6){
                if(gameBoard[col+2][line] == 0){
                    colResult2 = col+2
                    possibleRight= true;
                }
            }
        }
        if(gameBoard[col+1][line] == 0){
            colResult2 = col+1;
            possibleRight = true;
        }
    }
    let res1 = new Place(colResult1, line,0);
    let res2 = new Place(colResult2, line,0);
    let pos = possibleLeft&&possibleRight&&(cumul >=2)&&findPlace(moves, res1)&&findPlace(moves,res2);
    if(pos){
        return [res1.x, res2.y];
    }
    return null;
}

function twoAlignDiagonalTopLBottomR(place,gameBoard,color,moves){
    let col = place.x;
    let line = place.y;
    // left
    let cumul = 1;
    let possibleLeft = false;
    let possibleRight = false;
    let colResult1;
    let colResult2;
    let lineResult1;
    let lineResult2;
    if(col-1 >= 0 && line+1 <=5){
        if(gameBoard[col-1][line+1] == color){
            cumul++;
            if(col-2 >= 0 && line+2 <=5){
                if(gameBoard[col-2][line+2] == 0){
                    colResult1 = col-2;
                    lineResult1 = line+2;
                    possibleLeft= true;
                }
            }
        }
        if(gameBoard[col-1][line+1] == 0){
            colResult1 = col-1;
            lineResult1 = line+1;
            possibleLeft = true;
        }
    }
    //right
    if(col+1 <=6 && line-1 >=0){
        if(gameBoard[col+1][line-1] == color){
            cumul++;
            if(col+2 <=6 && line-2 >=0){
                if(gameBoard[col+2][line-2] == 0){
                    colResult2 = col+2;
                    lineResult2 = line-2;
                    possibleRight= true;
                }
            }
        }
        if(gameBoard[col+1][line-1] == 0){
            colResult2 = col+1;
            lineResult2 = line-1;
            possibleRight = true;
        }
    }
    let res1 = new Place(colResult1, lineResult1,0);
    let res2 = new Place(colResult2, lineResult2,0);
    let pos = possibleLeft&&possibleRight&&(cumul >=2)&&findPlace(moves, res1)&&findPlace(moves,res2);
    if(pos){
        return [res1.x, res2.y];
    }
    return null;
}

function twoAlignDiagonalTopRBottomL(place,gameBoard,color,moves){
    let col = place.x;
    let line = place.y;
    // left
    let cumul = 1;
    let possibleLeft = false;
    let possibleRight = false;
    let colResult1;
    let colResult2;
    let lineResult1;
    let lineResult2;
    if(col+1 <=6 && line+1 <=5){
        if(gameBoard[col+1][line+1] == color){
            cumul++;
            if(col+2 <=6 && line+2 <=5){
                if(gameBoard[col+2][line+2] == 0){
                    colResult1 = col+2;
                    lineResult1 = line+2;
                    possibleLeft= true;
                }
            }
        }
        if(gameBoard[col+1][line+1] == 0){
            colResult1 = col+1;
            lineResult1 = line+1;
            possibleLeft = true;
        }
    }
    //right
    if(col-1 >=0 && line-1 >=0){
        if(gameBoard[col-1][line-1] == color){
            cumul++;
            if(col-2 >=0 && line-2 >=0){
                if(gameBoard[col-2][line-2] == 0){
                    colResult2 = col-2;
                    lineResult2 = line-2;
                    possibleRight= true;
                }
            }
        }
        if(gameBoard[col-1][line-1] == 0){
            colResult2 = col-1;
            lineResult2 = line-1;
            possibleRight = true;
        }
    }
    let res1 = new Place(colResult1, lineResult1,0);
    let res2 = new Place(colResult2, lineResult2,0);
    let pos = possibleLeft&&possibleRight&&(cumul >=2)&&findPlace(moves, res1)&&findPlace(moves,res2);
    if(pos){
        return [res1.x, res2.y];
    }
    return null;
}

function twoAlignDiagonal(place,gameBoard,color,moves){
    let move = twoAlignDiagonalTopRBottomL(place,gameBoard,color,moves);
    if(move == null){
        move = twoAlignDiagonalTopLBottomR(place,gameBoard,color,moves);
    }
    return move;
}

function twoAlign(place, gameBoard, color, moves){
    let move = null;
    move = twoAlignHonrizontal(place,gameBoard,color,moves);
    if(move == null){
        move = twoAlignDiagonal(place,gameBoard,color,moves);
    }
    return move;
}

function findPlace(arr, place) {
    return arr.some(p => p.equals(place));
  }


function avoidToBeBlocked(gameBoard, color) {
    let colorAdverse = color == 1 ? 2 : 1;
    let moves = getPossibleMoves(gameBoard);
    let places = getPlaces(colorAdverse, gameBoard);
    for( let place of places){
        let move = twoAlign(place, gameBoard, colorAdverse, moves);
        if(move != null){
            return move;
        }
    }
}

function computeMove(board,color){
    console.time();
    // try to whin
    let move = null;
    move = tryToWin(board, color);
    if(move == null){
        move = tryToContre(board, color);
    }
    if(move == null){
        move = computeMove2(board, color);
    }
    console.timeEnd();
    return goodLine(board,move);
}

exports.computeMove= computeMove;
exports.contre= contre;
class Place {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
    }

    equals(other) {
        if (!(other instanceof Place)) {
          return false;
        }
        return this.x === other.x && this.y === other.y && this.value === other.value;
    }
}
let ia = 0;
let player = 0;
let board;

/**
 * Création du board
 */
function initBoard(){
    board = new Array(7);
    for (let i = 0; i < 7; i++)
    {
        board[i] = new Array(6);
        for (let j = 0; j < 6; j++){
            board[i][j] = 0;
        }
    }
}
function setup(AIplays){
    initBoard();
    ia = AIplays;
    player = ia === 1 ? 2 : 1;
    return true;
}

function nextMove(lastMove){
    return new Promise(function(resolve, reject) {
        if(lastMove.length !== 0){
            board[lastMove[0]][lastMove[1]] = player;
        }
        let move = computeMove(board,ia);
        board[move[0]][move[1]] = ia;
        resolve(move);
    });
}

exports.setup= setup;
exports.nextMove= nextMove;

