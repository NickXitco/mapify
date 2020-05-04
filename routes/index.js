const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const mongoDB = 'mongodb://127.0.0.1/my_database'
mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.set('useUnifiedTopology', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

/* GET home page. */
router.get('/', function (req, res) {
    res.sendFile("index.html");
    res.status(200).json({ message: 'Connected!' });
});

module.exports = router;

/*
require('../models/ColorModel');

const c = mongoose.model('Color');
const cInst = new c({r: 155, g: 189, b: 211, a: 32});
cInst.save(function (err) {
    if (err) return handleError(err);
});

console.log(cInst);

function handleError(err) {
    console.log(err)
}

*/
