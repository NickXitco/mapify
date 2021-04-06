const arangoDB = require('./ArangoDB');
const spotifyApiHolder = require('./SpotifyAPI');

async function getFence(fence) {
    const artists = await getArtistsInFence(fence);
    const genreInfo = await getGenres();
    const genres = {};

    for (const genre of genreInfo) {
        genre.name = genre.name.replace('&amp;', '&');
        genres[genre.name] = {
            r: genre.r,
            g: genre.g,
            b: genre.b,
            counts: 0,
            followers: 0,
            name: genre.name
        }
    }

    let numArtists = 0

    for (const artist of artists) {
        numArtists++;
        for (const genre of artist.genres) {
            if (!(genre in genres)) {
                console.log(genre);
                continue;
            }

            genres[genre].counts++;
            genres[genre].followers += artist.followers;
        }
    }

    const filtered = [];
    for (const genre of genreInfo) {
        const g = genres[genre.name]
        if (g.counts > 0) {
            g.followers = g.followers > 0 ? g.followers : 1;
            filtered.push(g)
        }
    }

    filtered.sort((a, b) => b.followers - a.followers);

    return JSON.stringify({
        numArtists: numArtists,
        numGenres: filtered.length,
        genres: filtered
    });
}

function getGenres() {
    const db = arangoDB.getDB();
    const query = `FOR g in genres RETURN g`;
    return db.query(query).then(cursor => cursor.all());
}

function getArtistsInFence(fence) {
    const db = arangoDB.getDB();

    const fenceString = fence.map(post => {
        return `[${post.longitude}, ${post.latitude}]`;
    })

    const query = `LET polygon = GEO_POLYGON(
                        [[${fenceString.toString()}]]
                        )
                    FOR x IN artists
                        FILTER GEO_CONTAINS(polygon, x.geo)
                        RETURN {genres: x.genres, followers: x.followers}
                    `
    return db.query(
        query
    ).then(
        cursor => cursor.all()
    );
}


module.exports = {getFence};