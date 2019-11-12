// Requires
var express = require('express');
const assert = require('assert');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
// Initializations
var app = express();

// Body parser config
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())



// variables
var passwrd = 'ONghQwga1uplwyUx'

// Route imports
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicRoutes = require('./routes/medic');
var uploadRoutes = require('./routes/upload');
var searchRoutes = require('./routes/search');
var imageRoutes = require('./routes/images');
// Database
const uri = `mongodb+srv://jimenez_paul:${passwrd}@cluster0-to844.mongodb.net/test?retryWrites=true&w=majority&database=adminpro`;

var connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(uri,connectionOptions,(err,resp)=>{
    assert.equal(err,null);
    console.log("Database status: \x1b[32m%s\x1b[0m", "ONLINE");
})

//Route definitions
app.use(fileUpload());
app.use('/users',userRoutes);
app.use('/hospitals',hospitalRoutes);
app.use('/medics',medicRoutes);
app.use('/search',searchRoutes);
app.use('/login',loginRoutes);
app.use('/upload',uploadRoutes);
app.use('/images',imageRoutes);
app.use('/',appRoutes);

app.listen(3000, () => {
    console.log("Listening on port 3000 \x1b[32m%s\x1b[0m", "ONLINE");

});