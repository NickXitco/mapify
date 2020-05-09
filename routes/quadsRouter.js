const express = require('express');
const router = express.Router();

const CameraResolver = require('../backend/CameraResolver');
const ImageEncoder = require('../backend/ImageEncoder');

router.get('/:x/:y/:width/:height', (req, res) => {
    const camera = {x: parseFloat(req.params.x),
                    y: parseFloat(req.params.y),
                    width: parseFloat(req.params.width),
                    height: parseFloat(req.params.height)};
    CameraResolver.resolveCamera(camera).then(response => {
        res.send(response);
    });
})

module.exports = router;