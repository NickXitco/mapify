const express = require('express');
const router = express.Router();

const ArtistFinder = require('../backend/ArtistFinder');

router.get('/:search', (req, res) => {
    ArtistFinder.findArtistSearch(req.params.search).then(response => {
        res.send(response);
    });
})

module.exports = router;