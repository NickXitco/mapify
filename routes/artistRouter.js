const express = require('express');
const router = express.Router();

const ArtistFinder = require('../backend/ArtistFinder');

router.get('/:query/:isQueryID', (req, res) => {
    ArtistFinder.findArtist(req.params.query, req.params.isQueryID === "true").then(response => {
        res.send(response);
    });
})

module.exports = router;