function checkLeft(board,place,js_color) {
  let colonne = place[0];
  let line = place[1];

  let compteur = 0;

  for (let i = colonne - 1; i >= 0; i--, compteur++) {
    if (board[i][line] !== js_color) break;
  }
  return compteur;
}

function checkRight(board,place,js_color) {
  let colonne = place[0];
  let line = place[1];

  let compteur = 0;

  for (let i = colonne + 1; i < 7; i++, compteur++) {
    if (board[i][line] !== js_color) break;
  }
  return compteur;
}

function checkBottom(board,place,js_color) {
  let colonne = place[0];
  let line = place[1];

  let compteur = 0;

  for (let i = line - 1; i >= 0; i--, compteur ++){
    if (board[colonne][i] !== js_color) break;
  }
  return compteur;
}

function checkTopLeft(board,place,js_color){
  let colonne = place[0];
  let line = place[1];

  let compteur = 0;

  for (let i = colonne - 1, j = line + 1; i >= 0 && j < 6; i--, j++, compteur ++){
    if (board[i][j] !== js_color) break;
  }
  return compteur;
}

function checkTopRight(board,place,js_color) {
  let colonne = place[0];
  let line = place[1];

  let compteur = 0;

  for (let i = colonne + 1, j = line + 1; i < 7 && j < 6; i++, j++, compteur ++){
    if (board[i][j] !== js_color) break;
  }
  return compteur;
}

function checkBottomLeft(board,place,js_color) {
  let colonne = place[0];
  let line = place[1];

  let compteur = 0;

  for (let i = colonne - 1, j = line - 1; i >= 0 && j >= 0; i--, j--, compteur ++){
    if (board[i][j] !== js_color) break;
  }
  return compteur;
}

function checkBottomRight(board,place,js_color) {
  let colonne = place[0];
  let line = place[1];

  let compteur = 0;

  for (let i = colonne + 1, j = line - 1; i < 7 && j >= 0; i++, j--, compteur ++){
    if (board[i][j] !== js_color) break;
  }
  return compteur;
}

function checkVictory(board,place,color){
  return checkBottom(board, place, color) >= 3
    || checkLeft(board, place, color) + checkRight(board, place, color) >= 3
    || checkBottomLeft(board, place, color) + checkTopRight(board, place, color) >= 3
    || checkBottomRight(board, place, color) + checkTopLeft(board, place, color) >= 3;

}

/**
 * Check if there is equality
 * @returns
 */
function checkEquality(board){
  for(let i = 0; i < 7; i++){
    if(board[i][5] === 0){
      return false;
    }
  }
  return true;
}

exports.checkVictory = checkVictory;
exports.checkEquality = checkEquality;
