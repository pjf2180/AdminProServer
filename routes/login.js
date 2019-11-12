var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED

app.post('/', (req, response) => {
    var body = req.body;

    User.findOne({ email: body.email }, (err, user) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error finding user',
                errors: err
            })
        }
        if (!user) {
            return response.status(400).json({
                ok: false,
                message: 'Invalid credentials - email',
                errors: err
            })
        }

        if (!bcrypt.compareSync(body.password, user.password)) {
            return response.status(400).json({
                ok: false,
                message: 'Invalid credentials - password',
                errors: err
            })
        }

        // Crear un token
        user.db.password = ';)'
        const token = jwt.sign(
            { user: user },
            SEED,
            { expiresIn: 14400 }
        );

        response.send({
            ok: true,
            id: user.id,
            token,
            message: 'Login post corect',
            body: body
        })
    })

})

module.exports = app;