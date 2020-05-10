const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const mongoDB = 'mongodb://127.0.0.1/mapifyDB'
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

//TODO commenting these in and out is really really bad practice, just make another node configuration


const dbCleaner = require('../backend/DatabaseCleaner');
//dbCleaner.cleanDB();

const dbPopulator = require('../backend/populateDatabase');
/*
dbPopulator.populateQuads().then(r => {
    if (r) {
        console.log("Quad population successful!");
    }
})

dbPopulator.populateArtists().then(r => {
    if (r) {
        console.log("Artist population successful!");
    }
})
 */