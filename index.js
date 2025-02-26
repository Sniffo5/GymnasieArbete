const express = require('express');
const bcrypt = require("bcryptjs");
const session = require('express-session');
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const escape = require('escape-html');
const validator = require('validator');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("client"));
app.use(express.static("public"));

const { createServer } = require("http");
const { Server } = require("socket.io");

const server = createServer(app);
const io = new Server(server);

server.listen(3678, () => {
    console.log("http://localhost:3678")
});

const sessionMiddleware = session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
});

app.use(sessionMiddleware);

io.engine.use(sessionMiddleware);

io.on("connection", handleConnection);

app.get("/", home);
app.post("/sendChat", sendChat);

function home(req, res) {
    const html = fs.readFileSync("templates/index.html").toString();
    req.session.id = uuidv4();
    res.send(html);
}

function handleConnection(socket) {
    const session = socket.request.session;
    session.socketId = socket.id;
    session.save();

    console.log(`Socket connected with session ID: ${session.id} and socket ID: ${session.socketId}`)

    io.emit("con", socket.id + " connected");

    socket.on("chat", (msg) => {
        if (!msg || !validator.isLength(msg, { min: 1, max: 500 })) return;

        msg = escape(msg);

        console.log(session.id + "( " + session.socketId + " ) " + " sent: "  + msg); // Debug log
        io.emit("chat", { id: socket.id, msg });
    });
}

function sendChat(req, res) {
    const { msg } = req.body;
    const session = req.session;

    if (!session.socketId) {
        return res.status(401).send("Unauthorized");
    }

    if (!msg || !validator.isLength(msg, { min: 1, max: 500 })) {
        return res.status(400).send("Invalid message");
    }

    const chatMessage = { sessionId: req.session.id, text: msg };

    console.log("Sending message from server:", chatMessage); // Debug log
    io.to(session.socketId).emit("chat", { id: session.socketId, msg: escape(msg) });

    res.send("Message sent");
}
