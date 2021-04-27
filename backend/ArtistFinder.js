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
        artist = await runSearch(query, 1);
        if (artist.length === 1) {
            artist = artist[0];
        } else {
            artist = null;
        }
    }

    if (!artist) {
        return {};
    }

    const realArtist = await spotifyApi.getArtist(artist.id).then(data => {
        return data;
    })

    const images = realArtist.body.images;
    const followers = realArtist.body.followers;
    const popularity = realArtist.body.popularity;
    const genres = realArtist.body.genres;
    //TODO update these values asynchronously?

    const track = await spotifyApi.getArtistTopTracks(artist.id, 'US').then(data => {
        return data.body.tracks.length > 0 ? data.body.tracks[0] : null;
    })

    const realRelated = await spotifyApi.getArtistRelatedArtists(artist.id).then(data => {
        return data.body.artists;
    })

    const ourRelated = await getRelated(artist.id);

    //TODO If an artist accrues new artists that aren't in the map, this will loop forever without the length check
    //  This is because our getRelated function only gets related artists that are actually in the map.
    //  Sylvester Stallone is an example that as of writing (4/17/2021) has a new artist that broke this function.
    //  I don't currently know the solution to this problem, something to look into.
    if (differentRelated(realRelated, ourRelated) && ourRelated.length === artist.related.length) {
        console.log(`Updating ${artist.name} related artists...`);
        await updateRelated(artist, realRelated);
        //updateGraphDB(artist, realRelated);
        return findArtist(query, isQueryID);
    }

    return {
        name: artist.name,
        id: artist.id,
        followers: followers,
        popularity: popularity,
        size: artist.size,
        x: artist.x,
        y: artist.y,
        r: artist.r,
        g: artist.g,
        b: artist.b,
        genres: genres,
        related: ourRelated,
        images: images,
        track: track
    };
}

function updateGraphDB(artist, realRelated) {
    const db = arangoDB.getDB();
    console.log(artist);
    console.log(realRelated);
}

function updateRelated(artist, realRelated) {
    const ids = [];
    const db = arangoDB.getDB();
    for (const a of realRelated) {
        ids.push(a.id);
    }

    const relatedString = JSON.stringify(ids);

    return db.query(
        `FOR a IN artists
            FILTER a.id == "${artist.id}"
            UPDATE a WITH { related: ${relatedString} } IN artists
        `
    ).then(
        cursor => cursor.all()
    );
}

function differentRelated(spotify, ours) {
    const spotifySet = new Set();
    for (const a of spotify) {
        spotifySet.add(a.id);
    }

    const ourSet = new Set();
    for (const a of ours) {
        ourSet.add(a.id);
    }

    for (const a of ours) {
        if (!spotifySet.has(a.id)) {
            return true
        }
    }

    for (const a of spotify) {
        if (!ourSet.has(a.id)) {
            return true
        }
    }

    return false;
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