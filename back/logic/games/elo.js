const K = 40; // constante de l'Elo

// Ici il faut récupérer les joueurs et leur rating
let playerA = {
    name: "Joueur A",
    elo: 1500,
};

let playerB = {
    name: "Joueur B",
    elo: 1500
};

// Fonction pour mettre à jour le rating des joueurs
// 0 pour une défaite, 0.5 pour un match nul, 1 pour une victoire
function calculateElo(player1, player2, score1, score2) {
    const expectedScore1 = expectedResult(player1.level, player2.level);
    const expectedScore2 = expectedResult(player2.level, player1.level);
    const newRating1 = player1.level + K * (score1 - expectedScore1);
    const newRating2 = player2.level + K * (score2 - expectedScore2);
    player1.level = parseInt(newRating1.toString());
    player2.level = parseInt(newRating2.toString());
    console.log(playerA.name + " a maintenant un rating de " + playerA.elo);
    console.log(playerB.name + " a maintenant un rating de " + playerB.elo);
    return;
}
exports.calculateElo = calculateElo;

function expectedResult(rating1, rating2) {
    return 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));
}