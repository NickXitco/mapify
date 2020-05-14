const mongoose = require('mongoose')

async function findArtist(id) {
    const Artist = mongoose.model('Artist');
    const artist = await Artist.findOne({id: id}).exec();

    return {
        name: artist.name,
        id: artist.id,
        followers: artist.followers,
        popularity: artist.popularity,
        size: artist.size,
        x: artist.x,
        y: artist.y,
        r: artist.r,
        g: artist.g,
        b: artist.b,
        genres: artist.genres,
        related: await Artist.find().where('id').in(artist.related).exec()
    };
}

async function findArtistSearch(searchterm) {
    const Artist = mongoose.model('Artist');

    const artist = await Artist.findOne({name: searchterm}).exec();
    if (artist) {
        return await findArtist(artist.id);
    }
}

function distance(x1, y1, x2, y2) {
    return Math.hypot((x2 - x1), (y2 - y1));
}

function contains(x, y, q) {
    return  x <= q.x + q.r && x >= q.x - q.r &&
            y >= q.y - q.r && y <= q.y + q.r;
}

module.exports = {findArtist, findArtistSearch};