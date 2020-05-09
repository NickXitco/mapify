const express = require('express');
const router = express.Router();

const QuadFinder = require('../backend/QuadFinder');
const ImageEncoder = require('../backend/ImageEncoder');

router.get('/:x/:y', (req, res) => {
    const x = parseFloat(req.params.x);
    const y = parseFloat(req.params.y);

    let image = ImageEncoder.encodeImage()
    const response = {x: x, y: y, sum: QuadFinder.findQuad(x, y), image: image}
    res.send(response);
})

module.exports = router;