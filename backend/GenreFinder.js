const mongoose = require('mongoose');

async function findGenre(name) {
    const Artist = mongoose.model('Artist');
    const Genre = mongoose.model('Genre');
    const artistPromise = Artist.find({genres: name}).exec();
    const genrePromise = Genre.findOne({name: name}).exec();
    return Promise.all([artistPromise, genrePromise]).then((values) => {
        const artists = values[0];
        const genreInfo = values[1];
        return {
            name: genreInfo.name,
            artists: artists,
            r: genreInfo.r,
            g: genreInfo.g,
            b: genreInfo.b
        };
    });
}

module.exports = {findGenre};