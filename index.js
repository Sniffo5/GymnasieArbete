const express = require('express');
const bcrypt = require("bcryptjs");
const session = require('express-session');
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const escape = require('escape-html');
const validator = require('validator');

const {render} = require("./utils.js");

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
app.get("/login", showLogin);
app.post("/login", login);
app.post("/register", register);
app.get("/register", showRegister);

function home(req, res) {
    const html = fs.readFileSync("html/chat.html").toString();
    req.session.id = uuidv4();
    res.send(render(html));
}

function showLogin(req, res) {
    const html = fs.readFileSync("html/loginForm.html").toString();
    res.send(render(html));
}

async function login(req, res){
    data = req.body;
    let users = JSON.parse(fs.readFileSync("users.json").toString());
    let userFind = users.find(u => u.email == data.email);

    if (!userFind) {
        return res.redirect("/login");
    }

    let check = await bcrypt.compare(data.password, userFind.password);

        if (!check) return res.redirect("/login?wrong_credentials");

        req.session.email = userFind.email;
        req.session.loggedIn = true;
        req.session.userId = userFind.id;
        res.redirect("/");

}

function showRegister(req, res) {
    const html = fs.readFileSync("html/registerForm.html").toString();
    res.send(render(html));
}

async function register(req, res) {
    
        let data = req.body;

        if (!validator.isEmail(data.email) || data.password == "") {
            return res.redirect("/register");
        }

        const token = uuidv4();
        data.password = await bcrypt.hash(data.password, 12);
        data.id = uuidv4();

        let users = JSON.parse(fs.readFileSync("users.json").toString());
        let userFind = users.find(u => u.email == data.email);
        if (userFind) {
            return res.send(render("User exists", req.session));
        }

        
        users.push(data);
        fs.writeFileSync("users.json", JSON.stringify(users, null, 3));

        req.session.email = data.email;
        req.session.loggedIn = false;
        req.session.userId = data.id;


        res.send(render(`Välkommen, ${data.email}! Ditt konto har skapats. Kolla din inkorg för att verifiera det.`, req.session));
    
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

        console.log(session.id + " ( " + session.socketId + " ) " + " sent: "  + msg); // Debug log
        io.emit("chat", { id: session.id, msg });
    });
}


