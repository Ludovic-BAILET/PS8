const buttonPlayIA = document.getElementById("buttonPlayIA");
buttonPlayIA.addEventListener('click', playIA);
buttonPlayIA.style.display = "none";

document.addEventListener("deviceready", addAchievment);

function playIA(){
    let parametre = 'gameIA';
    let nouvelleUrl = location.href + '?typegame=' + parametre;
    location.href = "./game/game.html" + '?typegame=' + parametre;
}

const buttonPlay1vs1 = document.getElementById("buttonPlay1vs1");
buttonPlay1vs1.addEventListener('click', play1vs1);
buttonPlay1vs1.style.display = "none";

function play1vs1(){
    let parametre = 'gameLocal';
    let nouvelleUrl = location.href + '?typegame=' + parametre;
    location.href = "./game/game.html" + '?typegame=' + parametre;
}

const buttonPlayOnline = document.getElementById("buttonPlayOnline");
if (localStorage.getItem("access_token") !== null){
  buttonPlayOnline.addEventListener('click', playOnline);
} else {
  // redirige vers https://www.youtube.com/watch?v=dQw4w9WgXcQ
  buttonPlayOnline.addEventListener('click', () => {
    console.log("redirection vers rickroll");
    //window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank")
      window.open("https://www.youtube.com/watch?v=XgUB3lF9IQA","_blank")
    // buttonPlayOnline.target = "_blank";
    // buttonPlayOnline.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  });
}

function playOnline(){
    buttonPlayOnline.style.display = "none";
    buttonPlayLocal.style.display = "none";
    buttonPlayRanked.style.display = "";
    buttonPlayRandom.style.display = "";
}

const buttonPlayLocal = document.getElementById("buttonPlayLocal");
buttonPlayLocal.addEventListener('click', playLocal);

function playLocal(){
    buttonPlayOnline.style.display = "none";
    buttonPlayLocal.style.display = "none";
    buttonPlayIA.style.display = "";
    buttonPlay1vs1.style.display = "";
}

const buttonPlayRanked = document.getElementById("buttonPlayRanked");
buttonPlayRanked.addEventListener('click', playRanked);
buttonPlayRanked.style.display = "none";

function playRanked(){
  let parametre = 'gameOnlineRanked';
  location.href = "./game/game.html" + '?typegame=' + parametre;
}

const buttonPlayRandom = document.getElementById("buttonPlayRandom");
buttonPlayRandom.addEventListener('click', playRandom);
buttonPlayRandom.style.display = "none";

function playRandom(){
  let parametre = 'gameOnlineRandom';
  location.href = "./game/game.html" + '?typegame=' + parametre;
}



/* Moving button */


let resetLeft = 0;
let resetTop = 0;
let n = 0;
const animateMove = (element, prop, pixels) =>
  anime({
    targets: element,
    [prop]: `${pixels}vw`,
    easing: "easeOutCirc"
  });

["mouseover", "click"].forEach(function (el) {
  buttonPlayOnline.addEventListener(el, function (event) {
    if(localStorage.getItem("access_token") == null){
        n = (n+1) % 2;
        console.log(n);
        if(n===0){
          animateMove(this, "left", resetLeft).play();
          animateMove(this, "top", resetTop).play();
        } else {
          const top = getRandomNumber(12);
          const left = getRandomNumber(12);
          resetLeft = -(left);
          resetTop = -(top);
          animateMove(this, "left", -2).play();
          animateMove(this, "top", -2).play();
          buttonPlayOnline.innerHTML="<a> Vous devez vous connecter</a>";
        }
    }
  });
});

const getRandomNumber = (num) => {
  let random = Math.floor(Math.random() * (num + 1));
  return random>4 ? random : 10;
};

function addAchievment(event){
  if (session.socket !== undefined && session.socket !== null) {
    if (device.platform === "iOS") {
      callAchivement("Jouer sur IOS")
    }
    if (device.platform === "Android") {
      callAchivement("Jouer sur Android")
    }
    if (device.isVirtual) {
      callAchivement("Je suis un développeur (jouer sur un émulateur)")
    }
  }
}

function callAchivement(achievement){
  fetch(session.url + "/api/addAchievement/", {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      //Usually there is a real syntax for tokens to be recognized, but here we don't need special treatment.
      'Token': localStorage.getItem("access_token")
    },
    body: JSON.stringify({achievement: achievement})
  }).then(async (response) => {
    if (response.status === 200) {
    } else {
      console.log("Error while adding achievement");
    }
  })
}
