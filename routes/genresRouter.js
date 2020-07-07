const express = require('express');
const router = express.Router();

const GenreFinder = require('../backend/GenreFinder');

router.get('/:genre', (req, res) => {
    GenreFinder.findGenre(req.params.genre).then(response => {
        res.send(response);
    });
})

module.exports = router;