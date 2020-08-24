const express = require('express');
const router = express.Router();

const GenreFinder = require('../backend/GenreFinder');

router.get('/:genre', (req, res) => {
    GenreFinder.findGenre(req.params.genre).then(response => {
        if (response.length === 0) {
            res.send({});
        } else {
            res.send(response[0]);
        }
    });
})

module.exports = router;