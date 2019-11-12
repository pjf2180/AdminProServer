var express = require('express');
var app = express();

app.get('/', (request, response) => {
    response.status(200).json({ collectionLength: 'works'})
})
module.exports = app;