const express = require('express');
const router = express.Router();

const QuadFinder = require('../backend/QuadFinder');

router.get('/:name', (req, res) => {
    QuadFinder.findQuad(req.params.name).then(response => {
        res.send(response);
    })
})

module.exports = router;