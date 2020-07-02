const mongoose = require('mongoose');

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

async function findArtistSearch(searchTerm) {
    const Artist = mongoose.model('Artist');
    const SUGGESTIONS_LIMIT = 5;
    return Artist.aggregate([
        {
            '$match': {
                '$text': {
                    '$search': searchTerm
                }
            }
        }, {
            '$addFields': {
                'score': {
                    '$meta': 'textScore'
                }
            }
        }, {
            '$addFields': {
                'sortScore': {
                    '$multiply': [
                        '$score', '$followers'
                    ]
                }
            }
        }, {
            '$sort': {
                'sortScore': -1
            }
        }, {
            '$unset': [
                'score', 'sortScore'
            ]
        }, {
            '$limit': SUGGESTIONS_LIMIT
        }
    ]).exec();
}

module.exports = {findArtist, findArtistSearch};