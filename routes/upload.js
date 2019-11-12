var express = require('express');
var app = express();
var User = require('../models/user');
var fs = require('fs');
var Medic = require('../models/medic');
var Hospital = require('../models/hospital');
var bcrypt = require('bcryptjs');
var auth = require('.././middlewares/auth').verifyToken;

app.put('/:type/:id', (req, res, next) => {

    var imageType = req.params.type;
    var id = req.params.id;
    var collectionTypes = ['user', 'medic', 'hospital'];
    if (collectionTypes.indexOf(imageType) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Image collection type not valid',
            errors: { message: `Valid collections ${collectionTypes}` }
        })
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No file selected',
            errors: { message: 'You must select an image' }
        })
    }
    // obtain file name
    var file = req.files.image;
    var fileSplit = file.name.split('.');
    var fileExtension = fileSplit[fileSplit.length - 1];

    // extension validation
    var permittedExtensions = ['png', 'gif', 'jpg', 'jpeg']
    if (permittedExtensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Invalid image extension',
            errors: { message: `Valid extensions: ${permittedExtensions} ` }
        })
    }
    var fileName = `${id} - ${new Date().getMilliseconds()}.${fileExtension}`;
    // move file from temp to path
    var path = `./uploads/${imageType}/${fileName}`;
    file.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error uploading file',
                errors: { message: err }
            })
        }
        uploadByType(imageType, id, fileName, res)
        // res.status(200).json({
        //     ok: true,
        //     message: "Request succesful",
        //     extension: fileExtension,
        //     path
        // })
    })



});

function uploadByType(type, id, fileName, res) {
    if (type === 'user') {
        User.findById(id, (err, user) => {
            if (!user) {
                res.status(400).json({
                    ok: true,
                    message: "User not found",
                })
            }
            var oldPath = './uploads/user/' + user.img;
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {

                });
            }
            user.img = fileName;
            user.save((err, updateduUser) => {
                return res.status(200).json({
                    ok: true,
                    message: "User image uploaded succesfully",
                    updateduUser
                })
            })
        })
    }
    if (type === 'medic') {
        Medic.findById(id, (err, medic) => {
            if (!medic) {
                res.status(400).json({
                    ok: true,
                    message: "Medic not found",
                })
            }
            var oldPath = './uploads/medic/' + medic.img;
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {

                });
            }
            medic.img = fileName;
            medic.save((err, updatedumedic) => {
                return res.status(200).json({
                    ok: true,
                    message: "Medic image uploaded succesfully",
                    updatedumedic
                })
            })
        })
    }
    if (type === 'hospital') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    message: "Hospital not found"
                })
            }
            var oldPath = './uploads/hospital/' + hospital.img;
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {

                });
            }
            hospital.img = fileName;
            hospital.save((err, updatehospital) => {
                return res.status(200).json({
                    ok: true,
                    message: "Hospital image uploaded succesfully",
                    hospital,
                    updatehospital,
                    err
                })
            })
        })
    }
}

module.exports = app;