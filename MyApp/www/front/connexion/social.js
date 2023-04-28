const url = session.url;

//On récupère les amis de l'utilisateur
let listeResultats;
getUsers();

// Récupération de la balise HTML de la barre de recherche
const barreDeRecherche = document.getElementById("barre-de-recherche");

// Récupération de la balise HTML où les résultats seront affichés
const listeResultatsHTML = document.querySelector("ul.add-friend");

// Fonction qui affiche les résultats de la recherche
function afficherResultats(recherche) {
    // Suppression des résultats précédents
    listeResultatsHTML.innerHTML = "";
    // Récupération des 4 premiers résultats correspondant à la recherche
    const resultats = listeResultats.filter(resultat => resultat.toLowerCase().includes(recherche.toLowerCase()) && resultat !== localStorage.getItem("username") && !listeAmis.includes(resultat) && !listeDemandes.includes(resultat)).slice(0, 4);

    // Affichage des résultats dans la liste HTML
    resultats.forEach(resultat => {
        const resultatHTML = document.createElement("li");
        resultatHTML.className = "add-friend";
        resultatHTML.textContent = resultat + " ";
        const buttonAddFriend = document.createElement("button");
        buttonAddFriend.value = resultat;
        buttonAddFriend.className = "add-friend";
        buttonAddFriend.textContent = "Ajouter";
        resultatHTML.appendChild(buttonAddFriend);
        listeResultatsHTML.appendChild(resultatHTML);
        buttonAddFriend.addEventListener("click", AddFriend);
    });
}

barreDeRecherche.addEventListener("keyup", () => {
    afficherResultats(barreDeRecherche.value);
});

function getUsers(){

    fetch(url + "/api/getUsers", {
        method: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Token': localStorage.getItem("access_token"),
        }
    }).then(async (response) => {
        let usersList = await response.json();
        listeResultats = usersList;
    });
}

//On récupère les demandes d'amis de l'utilisateur
let listeDemandes;
getAskedFriends();

//On affiche les demandes d'amis de l'utilisateur
function printAskedFriends(){

    const demandeAmis = document.getElementById("demande-d'amis");
    if(listeDemandes !== null ){
        listeDemandes.forEach((friend) => {
            const li = document.createElement("li");
            li.textContent = friend ;
            const buttonAcceptFriend = document.createElement("button");
            buttonAcceptFriend.value = friend;
            buttonAcceptFriend.className = "accept-friend";
            buttonAcceptFriend.textContent = "Accepter";
            li.appendChild(buttonAcceptFriend);
            const buttonRefuseFriend = document.createElement("button");
            buttonRefuseFriend.value = friend;
            buttonRefuseFriend.className = "refuse-friend";
            buttonRefuseFriend.textContent = "Refuser";
            li.appendChild(buttonRefuseFriend);
            demandeAmis.appendChild(li);
            buttonRefuseFriend.addEventListener("click", refuseFriend);
            buttonAcceptFriend.addEventListener("click", acceptFriend);
        });
    }

}


function getAskedFriends(){
    fetch(url + "/api/getWaitingFriends", {
        method: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Token': localStorage.getItem("access_token"),
        }
    }).then(async (response) => {
        let askedFriendsList = await response.json();
        listeDemandes = askedFriendsList;
        printAskedFriends();
    });
}


//Ask for a demand of friendship
function AddFriend(event){
    event.preventDefault();
    const friendName = event.target.value;
    fetch(url + "/api/askedFriend", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Token': localStorage.getItem("access_token"),
        },
        body: JSON.stringify({friend: friendName})
    }).then(async (response) => {
        let data = await response.text();
        if (data != "ok") { // changer cette condition
            location.href = "social.html";
        }
    });
}
//Accept a demand of friendship
function acceptFriend(event){
    event.preventDefault();
    const friendName = event.target.value;
    fetch(url + "/api/acceptFriend", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Token': localStorage.getItem("access_token"),
        },
        body: JSON.stringify({friend: friendName})
    }).then(async (response) => {
        let data = await response.text();
        if (data !== "ok") {
            location.href = "social.html";
        }
    });
}

//Refuse a demand of friendship
function refuseFriend(event){
    event.preventDefault();
    const friendName = event.target.value;
    fetch(url + "/api/refuseFriend", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Token': localStorage.getItem("access_token"),
        },
        body: JSON.stringify({friend: friendName})
    }).then(async (response) => {
        let data = await response.text();
        if (data !== "ok") {
            location.href = "social.html";
        }
    });
}


//On récupère les amis de l'utilisateur
let listeAmis;
getFriends();

function getFriends(){
    fetch(url + "/api/getFriends", {
        method: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Token': localStorage.getItem("access_token"),
        }
    }).then(async (response) => {
        let friendsList = await response.json();
        listeAmis = friendsList;
        showFriends();
    });
}

const listeAmisDiv = document.getElementById("liste-amis");

function showFriends(){
    for(let i = 0; i< listeAmis.length; i++){
        // container
        let container = document.createElement("div");
        container.setAttribute("class","container");

        // Image
        let image = document.createElement("img");
        image.setAttribute("class", "imageLeft");

        image.src = "../ressources/utilisateur.png";
        container.appendChild(image);

        //Right part
        let right = document.createElement("div");
        right.setAttribute("class","rightPart");


        //Delete button
        let deleteButton = document.createElement("a");
        deleteButton.setAttribute("class","bttn-delete");
        deleteButton.textContent = "Supprimer";
        deleteButton.value = listeAmis[i];
        deleteButton.href = "#0";
        deleteButton.addEventListener("click", deleteFriend);
        right.appendChild(deleteButton);

        //Name
        let name = document.createElement("p");
        name.setAttribute("class","nameAmis");
        name.textContent = listeAmis[i];
        right.appendChild(name);

        //Challenge button
        let challengeButton = document.createElement("a");
        challengeButton.setAttribute("class","bttn-challenge");
        challengeButton.textContent = "Défier";
        challengeButton.value = listeAmis[i];
        challengeButton.href = "#0";
        challengeButton.addEventListener("click", challengeFriend);
        right.appendChild(challengeButton);

        container.appendChild(right);
        listeAmisDiv.appendChild(container);
    }
}

function deleteFriend(friendName){
    fetch(url + "/api/deleteFriend", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Token': localStorage.getItem("access_token"),
        },
        body: JSON.stringify({friend: friendName.target.value})
    }).then(async (response) => {
        let data = await response.text();
        if (data !== "ok") {
            location.href = "social.html";
        }
    });
}

function challengeFriend(friendName){
    let parametre = 'challenge';
    location.href = "../game/game.html" + '?typegame=' + parametre + '&friend=' + friendName.target.value;
}


/* portrait */

const friendRequestButton = document.getElementById("friendRequest");
friendRequestButton.addEventListener("click", showFriendRequest);
const demandeDAmisDiv = document.getElementById("DemandeDamis");

const friendListButton = document.getElementById("friendList");
friendListButton.addEventListener("click", showFriendList);
const friendListDiv = document.getElementById("challengeAmis");

const addFriend = document.getElementById("addFriend");
addFriend.addEventListener("click", showAddFriend);
const addFriendDiv = document.getElementById("AjouterAmis");


function showFriendList(){
    demandeDAmisDiv.setAttribute("class","invisiblePart");
    addFriendDiv.setAttribute("class","invisiblePart");
    friendListDiv.setAttribute("class","visiblePart");   
}

function showFriendRequest(){
    demandeDAmisDiv.setAttribute("class","visiblePart");
    addFriendDiv.setAttribute("class","invisiblePart");
    friendListDiv.setAttribute("class","invisiblePart");
}

function showAddFriend(){
    demandeDAmisDiv.setAttribute("class","invisiblePart");
    addFriendDiv.setAttribute("class","visiblePart");
    friendListDiv.setAttribute("class","invisiblePart");  
}

document.addEventListener("deviceready", function () {
    window.addEventListener("orientationchange", function () {
        if(screen.orientation.type.includes("landscape")){
            demandeDAmisDiv.setAttribute("class","DemandeDamis");
            addFriendDiv.setAttribute("class","AjouterAmis");
            friendListDiv.setAttribute("class","challengeAmis");
        }});
    }
);