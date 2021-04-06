const express = require('express');
const router = express.Router();

const FenceFinder = require('../backend/FenceFinder');

router.post('/', (req, res) => {
    FenceFinder.getFence(req.body).then(response => {
        res.send(response);
    });
})

module.exports = router;