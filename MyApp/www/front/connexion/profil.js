// get the profile of the user
const url = session.url;

const pieChart = document.getElementById("piechart");


if(localStorage.getItem("access_token") !== null){

    fetch(url + "/api/getuser", {
        method: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Token': localStorage.getItem("access_token"),
        }
    }).then(async (response) => {
        let user = await response.json();
        if (user !== null) {
            console.log(user)
;            // display the user information
            document.getElementById("username").textContent = user.username;
            let username = user.username;
            document.getElementById("email").textContent = user.mail;

            document.getElementById("level").textContent = user.level;

            document.getElementById("nbGame").textContent = user.statistics.nbGames;
            document.getElementById("nbWin").textContent = user.statistics.nbWins;
            document.getElementById("nbLose").textContent = user.statistics.nbDefeats;
            document.getElementById("nbDraw").textContent = user.statistics.nbDraws;

            // display the pie chart
            let numberWin = user.statistics.nbWins;
            let numberGame = user.statistics.nbGames;
            let numberLose = user.statistics.nbDefeats;
            let numberDraw = user.statistics.nbDraws;

            let pourcentageWin = numberWin / numberGame;
            let pourcentageLose = numberLose / numberGame;
            let pourcentageDraw = numberDraw / numberGame;

            const slices = [
                { color: 'green', start: 0, end: pourcentageWin},
                { color: 'red', start: pourcentageWin, end: pourcentageWin + pourcentageLose },
                { color: 'blue', start: pourcentageWin + pourcentageLose, end: 1 }
            ];

            const gradient = `conic-gradient(${slices.map(slice => `${slice.color} ${slice.start * 360}deg ${slice.end * 360}deg`).join(', ')})`;

            pieChart.style.backgroundColor = "blue";
            pieChart.style.backgroundImage = gradient;

        }else{
            alert("mauvaise identification");
            location.href = "login.html";
        }
    });
}

const successButton = document.getElementById("succes");

successButton.addEventListener("click", (event) => {
    event.preventDefault();
    alert("Bravo ! Vous avez trouvé un bouton caché!");
});

const editButton = document.getElementById("editProfil");

editButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.target.textContent = "En construction";
});

const imgAchievment = document.getElementById("achievment");
imgAchievment.addEventListener("click", (event) => {
    event.preventDefault();
    location.href = "succes.html";
});


const succesButton = document.getElementById("succes");

succesButton.addEventListener("click", addAchievment);
function addAchievment(event){
    fetch(session.url + "/api/addAchievement/", {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            //Usually there is a real syntax for tokens to be recognized, but here we don't need special treatment.
            'Token': localStorage.getItem("access_token")
        },
        body: JSON.stringify({achievement: "Bouton2"})
    }).then(async (response) => {
        if (response.status === 200) {
        } else {
            console.log("Error while adding achievement");
        }
    })
}


