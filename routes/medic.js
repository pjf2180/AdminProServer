var express = require('express');
var app = express();
var Medic = require('../models/medic');
var auth = require('.././middlewares/auth').verifyToken;

app.get('/', (request, response) => {


    var from = request.query.from || 0;
    from = Number(from);
    Medic.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .exec((err, medics) => {
            if (err) {
                return response.status(500).json(
                    {
                        ok: false,
                        message: 'Error loading medics',
                        errors: err
                    }
                )
            }
            Medic.count({}, (err, count) => {
                response.send({
                    ok: true,
                    total: count,
                    medics
                })
            })

        })

})

app.post('/', auth, (req, response) => {
    var body = req.body;
    var medic = new Medic({
        name: body.name,
        img: body.img,
        user: body.user,
        hospital: body.hospital
    });

    medic.save((err, savedMedic) => {
        if (err) {
            return response.status(400).json(
                {
                    ok: false,
                    message: 'Error posting medic',
                    errors: err
                }
            )
        }
        response.send({
            ok: true,
            savedMedic,
            userToken: req.user
        })
    });
})

app.put('/:id', auth, (request, response) => {
    const medicId = request.params.id;
    var body = request.body;
    Medic.findById(medicId, (err, medic) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error updating Medic',
                errors: err
            })
        }
        if (!medic) {
            return reresponses.status(400).json({
                ok: false,
                message: `Medic ${medicId} does not exist`,
                errors: { message: 'No medic with that id' }
            })
        }
        medic.name = body.name;
        medic.img = body.img;
        medic.user = body.user;
        medic.hospital = body.hospital;

        medic.save((err, savedmedic) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    message: 'Error updating medic',
                    errors: err
                })
            }
            savedmedic.password = ':)'
            response.status(200).json({
                ok: true,
                medic: savedmedic
            })
        })

    })

})

app.delete('/:id', auth, (request, response) => {
    const medicId = request.params.id;
    var body = request.body;

    Medic.findByIdAndRemove(medicId, (err, res) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error deleting medic',
                errors: err
            })
        }
        response.status(200).json({
            ok: true,
            medic: res
        })
    })
})

module.exports = app;