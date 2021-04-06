const arangoDB = require('./ArangoDB');
const spotifyApiHolder = require('./SpotifyAPI');

async function getFence(fence) {
    const artists = await getArtistsInFence(fence);
    return JSON.stringify(artists);
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
                        SORT x.followers DESC
                        RETURN x
                    `


    return db.query(
        query
    ).then(
        cursor => cursor.all()
    );
}


module.exports = {getFence};