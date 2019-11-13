var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED


const { OAuth2Client } = require('google-auth-library');
var CLIENT_ID = require('../config/config').CLIENT_ID

const client = new OAuth2Client(CLIENT_ID);
// =======================================
// Google Auth
// =======================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        name: payload.name,
        email: payload.email,
        img: payload.img,
        google: true
    }
}
app.post('/google', async (request, response) => {
    var body = request.body;
    var token = body.token;
    var google_user = await verify(token)
        .catch(err => {
            return response.status(403)
                .json({
                    ok: false,
                    message: 'Invalid token'
                })
        });

    User.findOne({ email: google_user.email }, (err, dbUser) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: "Error finding user",
                errors: err
            })
        }
        if (dbUser) {
            if (dbUser.google_user) { 
                return response.status(400).json({
                    ok: false,
                    message: "Not registered with google"
                })
            } else {

                const token = jwt.sign(
                    { user: dbUser },
                    SEED,
                    { expiresIn: 14400 }
                );

                return response.send({
                    ok: true,
                    user: dbUser,
                    token,
                    message: 'Login post corect'
                })


            }
        } else {
            console.log('user does not exist');
            // user does not exsist
            var user = new User();
            user.name = google_user.name;
            user.email = google_user.email;
            user.img = google_user.img;
            user.googleuser = true;
            user.password = ':)';

            user.save((err, savedUser) => {
                const token = jwt.sign(
                    { user: savedUser },
                    SEED,
                    { expiresIn: 14400 }
                );

                return response.send({
                    ok: true,
                    user: savedUser,
                    token,
                    message: 'Login post corect',
                })
            })
        }
    })
    // return response.send({
    //     ok: true,
    //     message: 'Login post corect',
    //     google_user
    // })
})


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

        return response.send({
            ok: true,
            id: user.id,
            user,
            token,
            message: 'Login post corect'
        })
    })

})

module.exports = app;