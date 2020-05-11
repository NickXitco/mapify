const express = require('express');
const router = express.Router();

const ArtistFinder = require('../backend/ArtistFinder');

router.get('/:x/:y', (req, res) => {
    const x = parseFloat(req.params.x);
    const y = parseFloat(req.params.y);
    ArtistFinder.findArtist(x, y).then(response => {
        res.send(response);
    });
})

module.exports = router;