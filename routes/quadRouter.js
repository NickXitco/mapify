const express = require('express');
const router = express.Router();

const QuadFinder = require('../backend/QuadFinder');

router.get('/:name', (req, res) => {
    QuadFinder.findQuad(req.params.name).then(response => {
        if (response.length === 0) {
            res.send({});
        } else {
            res.send(response[0]);
        }
    })
})

module.exports = router;