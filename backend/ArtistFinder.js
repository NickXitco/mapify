const mongoose = require('mongoose')

async function findArtist(query, isQueryID) {
    const Artist = mongoose.model('Artist');
    let artist;
    if (isQueryID) {
        artist = await Artist.findOne({id: query}).exec();
    } else {
        artist = await Artist.findOne({name: query}).exec();
    }

    if (!artist) {
        return {};
    }

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
    const searchRegex = new RegExp(searchterm, 'i');
    return Artist.find({name: searchRegex}).sort({followers: -1, name: 1}).limit(5).exec();
}

module.exports = {findArtist, findArtistSearch};