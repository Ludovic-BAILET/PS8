export function getName() {
    console.log("cc");
    let token = localStorage.getItem("access_token");
    fetch(session.url+"/api/getToken/", {
        method: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // Usually there is a real syntax for tokens to be recognized, but here we don't need special treatment.
            'Token': token
        },
    }).then(async (response) => {
        let data = await response.text();
        // get the name field of the user in the data
        return JSON.parse(data).username
        // if the login worked, we should save the token.
    });
}

export function getMail(){
    let token = localStorage.getItem("access_token");
    fetch(session.url + "/api/getToken/", {
        method: "get",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            //Usually there is a real syntax for tokens to be recognized, but here we don't need special treatment.
            'Token': token
        },
    }).then(async (response) => {
        let data = await response.text();
        // get the name field of the user in the data
        return JSON.parse(data).mail;
        // if the login worked, we should save the token.
    });
}
