const express = require('express');
const router = express.Router();

const QuadFinder = require('../backend/QuadFinder');

router.get('/:x/:y', (req, res) => {
    const x = parseFloat(req.params.x);
    const y = parseFloat(req.params.y);

    const response = {x: x, y: y, sum: QuadFinder.findQuad(x, y)}

    res.send(response);
})

module.exports = router;