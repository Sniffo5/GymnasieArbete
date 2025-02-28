const fs = require("fs");

function render(content) {

    let html = fs.readFileSync("html/index.html").toString();

    html = html.replace("**content**", content);

    return html;
}

module.exports = {render};