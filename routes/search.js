var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medic = require('../models/medic');
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var auth = require('.././middlewares/auth').verifyToken;

app.get('/for/:table/:searchCriteria', (req, res) => {
    var searchCriteria = req.params.searchCriteria;
    var table = req.params.table;
    var regex = new RegExp(searchCriteria, 'i');
    var prom;
    switch (table) {
        case 'users':
            prom = searchUsers(searchCriteria, regex);
            break;
        case 'hospitals':
            prom = searchHospitals(searchCriteria, regex);
            break;
        case 'medics':
            prom = searchMedics(searchCriteria, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'Search type not found',
                error: {
                    message: 'Table not valid'
                }
            })

    }
    prom.then((data) => {
        return res.status(200).json({
            ok: true,
            [table]: data
        })
    })
})

app.get('/all/:search', (req, res, next) => {
    var search = req.params.search;
    var regex = new RegExp(search, 'i');
    var proms = [
        searchHospitals(search, regex),
        searchMedics(search, regex),
        searchUsers(search, regex)
    ];
    Promise.all(proms).then((results) => {
        res.status(200).send({
            hospitals: results[0],
            medics: results[1],
            users: results[2]
        })
    })
})

function searchHospitals(searchCriteria, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ name: regex })
            .populate()
            .exec((err, hospitals) => {
                if (err) {
                    reject('Error loading hospitals', err)
                } else {
                    resolve(hospitals)
                }
            })
    })
}
function searchMedics(searchCriteria, regex) {
    return new Promise((resolve, reject) => {
        Medic.find({ name: regex })
            .populate('user', 'name email role')
            .exec((err, hospitals) => {
                if (err) {
                    reject('Error loading medics', err)
                } else {
                    resolve(hospitals)
                }
            })
    })
}
function searchUsers(searchCriteria, regex) {
    return new Promise((resolve, reject) => {
        User.find({}, 'name email role')
            .or([{ 'name': regex }, { 'email': regex }])
            .exec((err, users) => {
                if (err) {
                    reject('Error loading users', err)
                } else {
                    resolve(users)
                }
            })
    })
}

module.exports = app;