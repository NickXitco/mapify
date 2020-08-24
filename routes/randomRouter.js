const express = require('express');
const router = express.Router();

const RandomHelper = require('../backend/RandomHelper');

router.get('/', (req, res) => {
    RandomHelper.getRandomNode().then(response => {
        if (response.length === 0) {
            res.send({});
        } else {
            res.send(response[0]);
        }
    });
})

module.exports = router;