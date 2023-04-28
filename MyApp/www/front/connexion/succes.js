const url = session.url;
const Succes = document.getElementById("ListOfSucces");

const ListOfSucces = [
    "Gagner 1 partie en mode classé",
    "Gagner 5 parties en mode classé",
    "Gagner 10 en mode parties classé",
    "Gagner 20 en mode parties classé",
    "Perdre 1 partie en mode classé",
    "Perdre 5 parties en mode classé",
    "Perdre 10 parties en mode classé",
    "Débloquer tous les trophées",
    "Trouver tous les boutons cachés",
    "Obtenir la patate dorée",
    "Faire un nul",
    "Jouer sur IOS",
    "Jouer sur Android",
    "Je suis un développeur (jouer sur un émulateur)"
];

let ListOfAchievment = [];
let partieWin;
let partieLose;
let partieDraw;
getStatistics();
getAchievements();


//Je récupère les informations de l'utilisateur notamment ses achievements
function getAchievements(){
fetch(url + "/api/getAchievements", {
    method: "get",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Token': localStorage.getItem("access_token"),
    }
}).then(async (response) => {
    let listAchievment = await response.json();
    console.log(listAchievment);

    for (let i = 0; i < ListOfSucces.length; i++) {
        let div = document.createElement("div");

        if(ListOfAchievment.includes(ListOfSucces[i])) {
            div.setAttribute("class", "achievment deblock");
        }else {
            div.setAttribute("class", "achievment bloqué");

        }

        let image = document.createElement("img");
        image.setAttribute("class", "imageAchievement");
        let p = document.createElement("p");
        p.textContent = ListOfSucces[i];
        //image.width = 128;


        if(div.className.includes("bloqué")) {
            //image.setAttribute("class", "bloqué");
            image.src = "../ressources/trophee.png";
            p.setAttribute("class", "bloqué")
        } else {
            //image.setAttribute("class", "deblock");
            image.src = "../ressources/achievement.png";
            p.setAttribute("class", "deblock")
        }
        div.appendChild(image);
        div.appendChild(p);
        Succes.appendChild(div);
    }
});
}

//Je récupère les informations de l'utilisateur notamment ses statistiques
function getStatistics() {
    fetch(url + "/api/getuser", {
        method: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Token': localStorage.getItem("access_token"),
        }
    }).then(async (response) => {
        this.user = await response.json();
        partieWin = this.user.statistics.nbWins;
        partieLose = this.user.statistics.nbDefeats;
        partieDraw = this.user.statistics.nbDraws;

        listAchievment = this.user.achievements;
        console.log(listAchievment);

        for (let i = 0; i < listAchievment.length; i++) {
            ListOfAchievment.push(listAchievment[i].toString());
        }
        if (partieWin >= 1) {
            ListOfAchievment.push(ListOfSucces[0].toString());
        }
        if (partieWin >= 5) {
            ListOfAchievment.push(ListOfSucces[1].toString());
        }
        if (partieWin >= 10) {
            ListOfAchievment.push(ListOfSucces[2].toString());
        }
        if (partieWin >= 20) {
            ListOfAchievment.push(ListOfSucces[3].toString());
        }
        if (partieLose >= 1) {
            ListOfAchievment.push(ListOfSucces[4].toString());
        }
        if (partieLose >= 5) {
            ListOfAchievment.push(ListOfSucces[5].toString());
        }
        if (partieLose >= 10) {
            ListOfAchievment.push(ListOfSucces[6].toString());
        }
        if (ListOfAchievment.length === 10) {
            ListOfAchievment.push(ListOfSucces[7].toString());

        }
        if (partieDraw >= 1) {
            ListOfAchievment.push(ListOfSucces[10].toString());

        }
        if (ListOfAchievment.includes('Bouton1') && ListOfAchievment.includes('Bouton2')) {
            ListOfAchievment.push(ListOfSucces[8].toString());

        }
        if (ListOfAchievment.includes('PatateDorée')) {
            ListOfAchievment.push(ListOfSucces[9].toString());
        }

    });

}

