const express = require('express');
const router = express.Router();

const clientID = 'ed5d131653384c60aa71bb39150c4e50'
router.get('/', function(req, res) {
    const scopes = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + clientID +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent('artistobs://logincallback'));
});

module.exports = router;