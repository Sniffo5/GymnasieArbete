var socketClient = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const messagesDiv = document.getElementById("messages");

socketClient.on("connect", () => {
    console.log("Connected to server with ID:", socketClient.id);
});

form.addEventListener("submit", handleSubmit);

function handleSubmit(e) {
    e.preventDefault();
    let msg = input.value.trim();

    if (msg) {
        console.log("Sending message:", msg); 
        socketClient.emit("chat", msg); 
        input.value = ""; 
    }
}

socketClient.on("chat", function (data) {
    console.log("Received message:", data); 
    const messageElement = document.createElement("div");
    messageElement.textContent = data.msg; 
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});