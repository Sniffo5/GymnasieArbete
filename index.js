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

const {createServer} = require("http");
const {Server} = require("socket.io");

const server = createServer(app);
const io = new Server(server);

server.listen(3678, ()=>{
    console.log("http://localhost:3678")
});

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

io.on("connection", handleConnection);





app.get("/", home);



/* ---------------------------------------------------------- */

function home(req,res){

    html = fs.readFileSync("./index.html").toString();

    req.session.id = uuidv4();
    req.session.test = "df"

    console.log(req.session.id)

    res.send(html);
}

/* ---------------------------------------------------------- */

function handleConnection(socket){

    console.log(socket.id + " connected");

  
    io.emit("con", socket.id + " connected");


    socket.on("chat", function(msg){

        console.log(socket.id + ": " + msg);
        io.emit("chat", {id:socket.id, msg});

    });

}
