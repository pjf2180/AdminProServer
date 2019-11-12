var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var bcrypt = require('bcryptjs');
var auth = require('.././middlewares/auth').verifyToken;





app.get('/', (request, response) => {

    var from = request.query.from || 0;
    from = Number(from);
    Hospital.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .exec((err, hospitals) => {
            if (err) {
                return response.status(500).json(
                    {
                        ok: false,
                        message: 'Error loading hospitals',
                        errors: err
                    }
                )
            }
            Hospital.count({}, (err, count) => {
                response.send({
                    ok: true,
                    total: count,
                    hospitals
                })
            })

        })

})





app.post('/', auth, (req, response) => {
    var body = req.body;
    var hospital = new Hospital({
        name: body.name,
        img: body.img,
        user: body.user
    })
    hospital.save((err, savedhospital) => {
        if (err) {
            return response.status(400).json(
                {
                    ok: false,
                    message: 'Error posting hospital',
                    errors: err
                }
            )
        }
        response.send({
            ok: true,
            savedhospital,
            hospitalToken: req.hospital
        })
    });
})

app.put('/:id', auth, (request, response) => {
    const hospitalId = request.params.id;
    var body = request.body;
    Hospital.findById(hospitalId, (err, hospital) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error loading hospital',
                errors: err
            })
        }
        if (!hospital) {
            return reresponses.status(400).json({
                ok: false,
                message: `Hospital ${hospitalId} does not exist`,
                errors: { message: 'No hospital with that id' }
            })
        }
        hospital.name = body.name;
        hospital.img = body.img;
        hospital.user = body.user;

        hospital.save((err, savedhospital) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    message: 'Error updating hospital',
                    errors: err
                })
            }
            savedhospital.password = ':)'
            response.status(200).json({
                ok: true,
                hospital: savedhospital
            })
        })

    })

})

app.delete('/:id', auth, (request, response) => {
    const hospitalId = request.params.id;
    var body = request.body;

    Hospital.findByIdAndRemove(hospitalId, (err, res) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error deleting hospital',
                errors: err
            })
        }
        response.status(200).json({
            ok: true,
            deletedhospital: res
        })
    })
})
module.exports = app;