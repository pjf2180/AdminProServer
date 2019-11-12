var express = require('express');
var app = express();
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var auth = require('.././middlewares/auth').verifyToken;




app.get('/', (request, response) => {

    var from = request.query.from || 0;
    from = Number(from);
    User.find({})
        .skip(from)
        .limit(5)
        .exec((err, users) => {
            if (err) {
                return response.status(500).json(
                    {
                        ok: false,
                        message: 'Error loading users',
                        errors: err
                    }
                )
            }
            User.count({}, (err, count) => {
                response.send({
                    ok: true,
                    total: count,
                    users
                })
            })

        })

})

app.post('/', auth, (req, response) => {
    var body = req.body;
    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    })
    user.save((err, savedUser) => {
        if (err) {
            return response.status(400).json(
                {
                    ok: false,
                    message: 'Error posting user',
                    errors: err
                }
            )
        }
        response.send({
            ok: true,
            savedUser,
            userToken: req.user
        })
    });
})

app.put('/:id', auth, (request, response) => {
    const userId = request.params.id;
    var body = request.body;
    User.findById(userId, (err, user) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error loading user',
                errors: err
            })
        }
        if (!user) {
            return reresponses.status(400).json({
                ok: false,
                message: `User ${userId} does not exist`,
                errors: { message: 'No user with that id' }
            })
        }
        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save((err, savedUser) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    message: 'Error updating user',
                    errors: err
                })
            }
            savedUser.password = ':)'
            response.status(200).json({
                ok: true,
                user: savedUser
            })
        })

    })

})

app.delete('/:id', auth, (request, response) => {
    const userId = request.params.id;
    var body = request.body;

    User.findByIdAndRemove(userId, (err, res) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error deleting user',
                errors: err
            })
        }
        response.status(200).json({
            ok: true,
            user: res
        })
    })
})
module.exports = app;