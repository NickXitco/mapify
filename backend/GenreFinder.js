const mongoose = require('mongoose');

async function findGenre(name) {
    const Artist = mongoose.model('Artist');
    return await Artist.find({genres: name}).exec();
}

module.exports = {findGenre};