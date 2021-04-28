const express = require('express');
const router = express.Router();

const ShortestPathFinder = require('../backend/ShortestPathFinder');

router.get('/:source/:target/:weighted', (req, res) => {
    ShortestPathFinder.getShortestPath(req.params.source, req.params.target, req.params.weighted).then(response => {
        res.send(response);
    });
})

module.exports = router;