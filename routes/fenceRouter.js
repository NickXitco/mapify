const express = require('express');
const router = express.Router();

const FenceFinder = require('../backend/FenceFinder');

router.post('/', (req, res) => {
    FenceFinder.getFence(req.body).then(response => {
        res.send(response);
    }).catch(err => {
        console.log(err);
        res.send(JSON.stringify( 'error in finding fence'));
    });
})

module.exports = router;