var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

app.get('/:type/:img', (request, response) => {
    var imageName = request.params.img;
    var imagetype = request.params.type;
    var imagepath = path.resolve(__dirname, `../uploads/${imagetype}/${imageName}`);
    if (fs.existsSync(imagepath)) {
        response.sendFile(imagepath)
    } else {
        var pathNoImg = path.resolve(__dirname, '../assets/no-img.jpg');
        response.sendFile(pathNoImg);
    }

})
module.exports = app;