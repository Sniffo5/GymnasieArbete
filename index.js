const express = require('express');
const bcrypt = require("bcryptjs");
const session = require('express-session');
const app = express();
app.use(express.urlencoded({extended:true}));
const fs = require("fs");

app.use(express.static("public"));
app.listen(3000, () => console.log("http://localhost:3000/"));

app.get("/", home);

function home(req,res){

    html = fs.readFileSync("./template.html").toString();

    res.send(html);
}
