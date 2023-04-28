const box = document.getElementById('box');
const toggleBtn = document.getElementById('toggle-btn');
const wrapper = document.getElementById('wrapper');
const message = document.getElementById('message');
const friendList = document.getElementById('friendsList');
const arrowWrapper = document.getElementById('arrow-wrapper');
const messageHolder = document.getElementById("message");
let isExpanded = false;

/**
 * Messages
 */

function sendMessageToFriend(){
  let sendMessage = {
    username: localStorage.getItem("username"),
    message: message.value,
    token: localStorage.getItem("access_token"),
    friend: document.getElementsByClassName("selected")[0].id
  }

  console.log(sendMessage);

  message.value = "";
  session.socket.emit('newMessageForFriend', JSON.stringify(sendMessage));
}


function ReceiveMessageFromFriend(message, insert = true){
  console.log("ReceiveMessage");
  console.log(message);

  // on parse le message
  let messageJSON = JSON.parse(message);

  // On récupère les messages de l'utilisateur et on ajoute le nouveau message
  let messages = JSON.parse(localStorage.getItem(messageJSON.users));

  if (insert) {
    console.log("insertion")
    messages.push(messageJSON);
    localStorage.setItem(messageJSON.users, JSON.stringify(messages));
    if (messageJSON.user !== localStorage.getItem("username")){
      if (toggleBtn.classList.contains("has-new-message") === false ){
        toggleBtn.classList.toggle("has-new-message");
      }
      console.log(messageJSON.user);

      let selected = document.getElementsByClassName("selected")[0];
      console.log("otu");
      if (!selected){
        if (document.getElementById(messageJSON.user).classList.contains("has-new-message") === false){
          document.getElementById(messageJSON.user).classList.toggle("has-new-message");
        }
        let newMessages = JSON.parse(localStorage.getItem("newMessage"));
        newMessages.push(messageJSON.user);
        localStorage.setItem("newMessage", JSON.stringify(newMessages));
      }
    }
  }

  // On récupère le nom de l'utilisateur
  let username = localStorage.getItem("username");
  let div = document.createElement("div");

  // On ajoute la classe messageByYou ou messageByOther
  div.setAttribute("class","message " + (messageJSON.user === username ? "messageByYou" : "messageByOther"));

  // On créer la div qui contient le nom de l'utilisateur et la date
  let infoMessage = document.createElement("div");
  infoMessage.setAttribute("class","infoMessage");

  // On créer la div qui contient le nom de l'utilisateur
  let name = document.createElement("div");
  name.setAttribute("class","sender");
  name.innerText = messageJSON.user === username ? "Vous" : messageJSON.user;

  // On ajoute le nom de l'utilisateur à la div
  infoMessage.appendChild(name);

  // On créer la div qui contient la date
  let date = document.createElement("div");
  date.setAttribute("class","date");
  let goodDate = new Date(messageJSON.date);
  let hours = goodDate.getHours() < 10 ? "0" + goodDate.getHours() : goodDate.getHours();
  let minutes = goodDate.getMinutes() < 10 ? "0" + goodDate.getMinutes() : goodDate.getMinutes();
  date.innerText = hours + ":" + minutes;

  // On ajoute la date à la div
  infoMessage.appendChild(date);
  // On ajoute la div qui contient le nom de l'utilisateur et la date à la div principale
  div.appendChild(infoMessage);
  // On créer la div qui contient le message
  let messageDiv = document.createElement("div");
  messageDiv.setAttribute("class","messageContent");
  messageDiv.innerText = messageJSON.message;
  // On ajoute la div qui contient le message à la div principale
  div.appendChild(messageDiv);
  // On ajoute la div principale au chat
  document.getElementById("friendChatContainer").appendChild(div);
}

function selectFriend(friend, div){
  console.log("click sur " + friend);
  let selected = document.getElementsByClassName("selected")[0];
  console.log("otu");
  if (selected){
    if (selected.classList.contains("has-new-message")){
      selected.classList.toggle("has-new-message");
    }
    if (selected.id === friend){
      return;
    }
    selected.classList.toggle("selected");
  }
  messageHolder.disabled = false ;
  div.classList.toggle("selected");
  if (div.classList.contains("has-new-message")){
    div.classList.toggle("has-new-message");
  }

  let newMessages = JSON.parse(localStorage.getItem("newMessage"));
  newMessages = newMessages.filter((message) => {
    return message !== friend;
  });
  localStorage.setItem("newMessage", JSON.stringify(newMessages));

  const parent = document.getElementById("friendChatContainer");
  let child = parent.lastElementChild;
  while (child) {
    parent.removeChild(child);
    child = parent.lastElementChild;
  }

  messageHolder.placeholder = "Message to " + friend;


  const users = (localStorage.getItem("username") < friend) ? localStorage.getItem("username") + "_" + friend : friend + "_" + localStorage.getItem("username");
  console.log(users);
  if (!localStorage.getItem(users)){
    fetch(session.url + "/api/getMessages", {
      method: "get",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'users': users,
      }
    }).then(async (response) => {
      let messages = await response.json();
      if (messages !== null) {
        console.log("Vous avez des messages dans la base de données");
        console.log(messages);
        localStorage.setItem(users, JSON.stringify(messages));
        console.log(localStorage.getItem(users));
        messages.forEach((message) => {
          console.log(message);
          ReceiveMessageFromFriend(JSON.stringify(message), false);
        });
      }else{
        console.log("Vous n'avez pas de messages");
        localStorage.setItem(users, "[]");

      }
    });
  } else {
    console.log("Vous avez des messages dans le local storage");
    console.log(JSON.parse(localStorage.getItem(users)));
    for(let message of JSON.parse(localStorage.getItem(users))) {
      console.log(message);
      ReceiveMessageFromFriend(JSON.stringify(message), false);
    }
  }
}


if (!session.socket){
  wrapper.style.display = 'none';
}
console.log(document.getElementsByClassName("selected")[0]);
if (!document.getElementsByClassName("selected")[0]){
  messageHolder.disabled = true;
}

toggleBtn.addEventListener('click', () => {
  isExpanded = !isExpanded;

  arrowWrapper.classList.toggle('expanded');
  wrapper.classList.toggle('expanded');
  box.classList.toggle('expanded');
  toggleBtn.classList.toggle('arrow-left');
  toggleBtn.classList.toggle('arrow-right');
  if (toggleBtn.classList.contains("has-new-message")){
    if (JSON.parse(localStorage.getItem("newMessage")).length === 0){
      toggleBtn.classList.toggle("has-new-message");
    }
  }
});

if(session.socket){
  session.socket.on('ReceiveMessageForFriend', ReceiveMessageFromFriend);

  fetch(session.url + "/api/getFriends", {
    method: "get",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Token': localStorage.getItem("access_token"),
    }
  }).then(async (response) => {
    if(response.status === 401){
      const div = document.createElement("div");
      div.textContent = 'Vous n\'êtes pas connecté';
      friendList.appendChild(div);
    }
    let friends = await response.json();
    if (friends !== null && friends.length !== 0) {
      console.log(friends);            // display the friends information
      console.log(friendList);     // display the number of friends
      //savoir si la friendsList est vide dans la promesse
      friends.forEach((friend) => {
        const div = document.createElement("div");
        div.textContent = friend;
        div.className = "friend";
        div.id = friend;
        div.addEventListener("click", function(event){
          selectFriend(friend, div);
        })

        friendList.appendChild(div);
      });
    }else{
      console.log("Vous n'avez pas d'amis");
    }
  });
  console.log("Vous êtes connecté");
  if (localStorage.getItem("newMessage")) {
    let newMessageUsers = JSON.parse(localStorage.getItem("newMessage"));
    for (let user of newMessageUsers) {
      document.getElementById(user).classList.toggle("has-new-message");
    }
    if (newMessageUsers.length !== 0) {
      toggleBtn.classList.toggle("has-new-message");
    }
  }else {
    localStorage.setItem("newMessage", "[]");
  }
}
