var socketClient = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const messagesDiv = document.getElementById("messages");

form.addEventListener("submit", handleSubmit);

function handleSubmit(e) {
    e.preventDefault();
    let msg = input.value.trim();

    if (msg) { 
        socketClient.emit("chat", msg); 
        input.value = ""; 
    }
}

socketClient.on("chat", function (data) { 
    const messageElement = document.createElement("p");
    messageElement.textContent = data.msg;
    messageElement.id = "msg";
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socketClient.on("user", function () { 
    let messageElement = document.getElementById("msg");
    messageElement.id = "";
    messageElement.classList.add("self");
});