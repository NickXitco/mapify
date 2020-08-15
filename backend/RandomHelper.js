const mongoose = require('mongoose');

async function getRandomNode() {
    const Artist = mongoose.model('Artist');
    return Artist.aggregate([
        {
            '$sample': {
                'size': 1
            }
        }
    ]).exec();
}

module.exports = {getRandomNode};

