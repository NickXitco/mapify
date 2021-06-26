const arangoDB = require('./ArangoDB');
const {aql} = require("arangojs");
const spotifyApiHolder = require('./SpotifyAPI');

let genreLists = [];
getGenres().then(
    genres => {
        genreLists = genres;
    }
)

async function getFence(fence) {
    const artists = await getArtistsInFence(fence);

    if (!artists) {
        //Error in fence
        return "Error in getting fence artists";
    }

    const genreInfo = genreLists.length > 0 ? genreLists : await getGenres();
    const genres = {};

    if (!genreInfo) {
        //Error in genres
        return "Error in getting genres";
    }

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

    genres["NO_GENRE"] = {
        r: 0,
        g: 0,
        b: 0,
        counts: 0,
        followers: 0,
        name: "No Genre"
    }

    let numArtists = 0

    for (const artist of artists) {
        numArtists++;
        if (artist.genres.length === 0) {
            genres["NO_GENRE"].counts++;
            genres["NO_GENRE"].followers += artist.followers;
        }

        for (const genre of artist.genres) {
            if (genres[genre] === undefined) {
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

    if (genres["NO_GENRE"].counts > 0) {
        genres["NO_GENRE"].followers = genres["NO_GENRE"].followers > 0 ? genres["NO_GENRE"].followers : 1;
        filtered.push(genres["NO_GENRE"]);
    }

    filtered.sort((a, b) => b.followers - a.followers);

    return JSON.stringify({
        numArtists: numArtists,
        numGenres: filtered.length,
        genres: filtered,
        top100: await getTopXInFence(fence, 100)
    });
}

async function getGenres() {
    const db = arangoDB.getDB();
    try {
        const cursor = await db.query(aql`FOR g in genres RETURN g`);
        let genres = [];
        for await (const genre of cursor) {
            genres.push(genre);
        }
        return genres;
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function getArtistsInFence(fence) {
    const db = arangoDB.getDB();

    const fenceString = fence.map(post => {
        return aql`[${post.longitude}, ${post.latitude}]`;
    })

    let query = aql`LET polygon = GEO_POLYGON(
                        [[${aql.join(fenceString, ", ")}]]
                        )
                    FOR x IN artists
                        FILTER GEO_CONTAINS(polygon, x.geo)
                        RETURN {genres: x.genres, followers: x.followers}
                    `
    try {
        const cursor = await db.query(query);
        let artists = [];
        for await (const a of cursor) {
            artists.push(a);
        }
        return artists;
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function getTopXInFence(fence, x) {
    const db = arangoDB.getDB();

    const fenceString = fence.map(post => {
        return aql`[${post.longitude}, ${post.latitude}]`;
    })

    const query = aql`LET polygon = GEO_POLYGON(
                        [[${aql.join(fenceString, ", ")}]]
                        )
                    FOR x IN artists
                        FILTER GEO_CONTAINS(polygon, x.geo)
                        SORT x.followers DESC
                        LIMIT ${x}
                        RETURN x
                    `

    try {
        const cursor = await db.query(query);
        let artists = [];
        for await (const a of cursor) {
            artists.push(a);
        }
        return artists;
    } catch (err) {
        console.error(err);
        return [];
    }
}


module.exports = {getFence};