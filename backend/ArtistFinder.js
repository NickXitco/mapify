const mongoose = require('mongoose');
const spotifyApiHolder = require('./SpotifyAPI');

async function findArtist(query, isQueryID) {
    const Artist = mongoose.model('Artist');
    const spotifyApi = spotifyApiHolder.getAPI();

    let artist;
    if (isQueryID) {
        artist = await Artist.findOne({id: query}).exec();
    } else {
        artist = await runSearch(query, Artist, 1);
        if (artist.length === 1) {
            artist = artist[0];
        } else {
            artist = null;
        }
    }

    if (!artist) {
        return {};
    }

    const images = await spotifyApi.getArtist(artist.id).then(data => {
        return data.body.images;
    })

    const track = await spotifyApi.getArtistTopTracks(artist.id, 'US').then(data => {
        return data.body.tracks.length > 0 ? data.body.tracks[0] : null;
    })

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
        related: await Artist.find().where('id').in(artist.related).exec(),
        images: images,
        track: track
    };
}

function runSearch(searchTerm, Artist, limit) {
    const spotifyApi = spotifyApiHolder.getAPI();

    return spotifyApi.searchArtists(searchTerm, {limit: limit, offset: 0})
        .then(function (data) {
            let promises = []
            for (const item of data.body.artists.items) {
                promises.push(Artist.findOne({id: item.id}).exec());
            }
            return Promise.all(promises).then((values) => {
                let realValues = []
                for (const value of values) {
                    if (value) {
                        realValues.push(value);
                    }
                }
                return realValues;
            })
        }, function (err) {
            console.error(err);
            return [];
        });
}

async function findArtistSearch(searchTerm) {
    const Artist = mongoose.model('Artist');
    const NUM_RESULTS = 5;
    return runSearch(searchTerm, Artist, NUM_RESULTS);
}

module.exports = {findArtist, findArtistSearch};