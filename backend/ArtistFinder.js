const arangoDB = require('./ArangoDB');
const spotifyApiHolder = require('./SpotifyAPI');

async function findArtist(query, isQueryID) {
    const spotifyApi = spotifyApiHolder.getAPI();

    let artist;
    if (isQueryID) {
        artist = await findOneArtistByID(query);
        if (artist.length === 1) {
            artist = artist[0];
        } else {
            artist = null;
        }
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
        related: await getRelated(artist.id),
        images: images,
        track: track
    };
}

function findOneArtistByID(id) {
    const db = arangoDB.getDB();
    return db.query(
        `FOR a in artists FILTER a.id == \"${id}\" LIMIT 1 RETURN a`
    ).then(
        cursor => cursor.all()
    );
}

function getRelated(id) {
    const db = arangoDB.getDB();
    return db.query(
        `FOR a IN artists
            FILTER a.id == "${id}"
            FOR r IN artists
                FILTER r.id IN a.related
                return r
        `
    ).then(
        cursor => cursor.all()
    );
}

function runSearch(searchTerm, limit) {
    const spotifyApi = spotifyApiHolder.getAPI();

    return spotifyApi.searchArtists(searchTerm, {limit: limit, offset: 0})
        .then(function (data) {
            let promises = []
            for (const item of data.body.artists.items) {
                promises.push(findOneArtistByID(item.id));
            }
            return Promise.all(promises).then((values) => {
                let realValues = []
                for (const value of values) {
                    if (value.length > 0) {
                        realValues.push(value[0]);
                    }
                }
                return realValues;
            })
        }, function (err) {
            console.error(err);
            return [];
        });
}

function genreSearch(searchTerm, limit) {
    const db = arangoDB.getDB();
    return db.query(
        `FOR doc IN genre_view
          SEARCH NGRAM_MATCH(doc.name, "${searchTerm}", 0.75, "genre_bigram")
          LET length = LENGTH(doc.name)
          LET score = BM25(doc)
          LET normalized = score / length
          FILTER normalized > 1
          SORT normalized DESC, doc.size DESC
          LIMIT ${limit}
          RETURN doc
        `
    ).then(
        cursor => cursor.all()
    );
}

async function findArtistSearch(searchTerm) {
    const NUM_RESULTS = 5;
    return Promise.all([genreSearch(searchTerm, NUM_RESULTS), runSearch(searchTerm, NUM_RESULTS)])
        .then(values => {
            return {genres: values[0], artists: values[1]};
        })
}

module.exports = {findArtist, findArtistSearch};