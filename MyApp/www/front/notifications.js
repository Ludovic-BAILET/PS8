let numberNotificationsFriend = localStorage.getItem("notificationsFriend") ? localStorage.getItem("notificationsFriend") : 0;
let numberNotificationsChallenge = localStorage.getItem("notificationsChallenge") ? localStorage.getItem("notificationsChallenge") : 0;

let notificationFriend = document.getElementById("newFriend");
let notificationChallenge = document.getElementById("newChallenge");
let bellIcon = document.getElementById("bellIcon");

let friendIcon = document.getElementById("friendIcon");
let challengeIcon = document.getElementById("challengeIcon");

notificationFriend.style.display = "none";
notificationChallenge.style.display = "none";

friendIcon.addEventListener("click", () => {
    friendIcon.classList.remove("notified");
    localStorage.removeItem("notificationsFriend");
    friendIcon.classList.add("Nonotified");


});
challengeIcon.addEventListener("click", () => {
    challengeIcon.classList.remove("notified");
    challengeIcon.classList.add("Nonotified");
    localStorage.removeItem("notificationsChallenge");
});
notificationFriend.addEventListener("click", () => {
    notificationFriend.style.display = "none";
});

notificationChallenge.addEventListener("click", () => {
    notificationChallenge.style.display = "none";
});

if (session.socket) {
    session.socket.on('NotificationFriend', (data) => {
        if (localStorage.getItem("notificationsFriend") === null) {
            localStorage.setItem("notificationsFriend", 0);
            numberNotificationsFriend = 0;
        }
        numberNotificationsFriend++;
        localStorage.setItem("notificationsFriend", numberNotificationsFriend);
        checkNumberNotification();

        document.getElementById("textFriend").innerHTML = numberNotificationsFriend > 1 ? "Vous avez " + numberNotificationsFriend + " d'amis. !" : "Vous avez une demande d'ami !"
        notificationFriend.style.display = "";
    });

    session.socket.on('NotificationChallenge', (data) => {
        console.log("NotificationChallenge");
        if (localStorage.getItem("notificationsChallenge") === null) {
            localStorage.setItem("notificationsChallenge", 0);
            numberNotificationsChallenge = 0;
        }
        numberNotificationsChallenge++;
        localStorage.setItem("notificationsChallenge", numberNotificationsChallenge);
        checkNumberNotification();
        document.getElementById("textChallenge").innerHTML = numberNotificationsChallenge > 1 ? "Vous avez " + numberNotificationsChallenge + " nouveaux challenges !" : "Vous avez un nouveau challenge !";
        notificationChallenge.style.display = "";
    });

    session.socket.on('NotificationCancelFriend', (data) => {
        if (localStorage.getItem("notificationsFriend") === null) {
            localStorage.setItem("notificationsFriend", 0);
            numberNotificationsFriend = 0;
        }
        numberNotificationsFriend > 0 ? numberNotificationsFriend-- : numberNotificationsFriend = 0;
        localStorage.setItem("notificationsFriend", numberNotificationsFriend);
        if (numberNotificationsFriend === 0) {
            notificationFriend.style.display = "none";
        } else {
            document.getElementById("textFriend").innerHTML = numberNotificationsFriend > 1 ? "Vous avez " + numberNotificationsFriend + " d'amis. !" : "Vous avez une demande d'ami !"
            notificationFriend.style.display = "";
        }
        checkNumberNotification();
    });

    session.socket.on('NotificationCancelChallenge', (data) => {
        console.log("NotificationCancelChallenge");
        if (localStorage.getItem("notificationsChallenge") === null) {
            localStorage.setItem("notificationsChallenge", 0);
            numberNotificationsChallenge = 0;
        }
        numberNotificationsChallenge > 0 ? numberNotificationsChallenge-- : numberNotificationsChallenge = 0;
        localStorage.setItem("notificationsChallenge", numberNotificationsChallenge);
        if (numberNotificationsChallenge === 0) {
            notificationChallenge.style.display = "none";
        } else {
            console.log(notificationChallenge.firstChild);
            document.getElementById("textChallenge").innerHTML = numberNotificationsChallenge > 1 ? "Vous avez " + numberNotificationsChallenge + " nouveaux challenges !" : "Vous avez un nouveau challenge !"
            notificationChallenge.style.display = "";
        }
        checkNumberNotification();
    });
}
function checkNumberNotification(){
    if(numberNotificationsFriend==0){
        friendIcon.classList.remove("notified");
        friendIcon.classList.add("Nonotified");
    }else{
        friendIcon.classList.remove("Nonotified");
        friendIcon.classList.add("notified");
    }
    if (numberNotificationsChallenge==0){
        challengeIcon.classList.remove("notified");
        challengeIcon.classList.add("Nonotified");
    }else{
        challengeIcon.classList.remove("Nonotified");
        challengeIcon.classList.add("notified");
    }
    if(numberNotificationsChallenge==0 && numberNotificationsFriend==0){
        bellIcon.classList.remove("notified");
        bellIcon.classList.add("Nonotified");
    } else {
        bellIcon.classList.remove("Nonotified");
        bellIcon.classList.add("notified");
    }
}
