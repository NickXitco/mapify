const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.sendFile("index.html");
    res.status(200).json({ message: 'Connected!' });
});

module.exports = router;