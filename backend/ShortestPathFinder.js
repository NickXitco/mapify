const arangoDB = require('./ArangoDB');
const spotifyApiHolder = require('./SpotifyAPI');

/**
 * Gets the shortest path between two points on the graph in the form of an ordered array of hops
 * @param source spotifyID of start point
 * @param target spotifyID of end point
 * @return Array of artist objects
 */
async function getShortestPath(source, target) {
    const db = arangoDB.getDB();
    const path = await db.query(
        `
            FOR source IN artists FILTER source.id == '${source}' 
            FOR target IN artists FILTER target.id == '${target}'
            FOR v, e IN OUTBOUND SHORTEST_PATH source TO target GRAPH 'artistGraph' OPTIONS {weightAttribute: "weight"} RETURN v
        `
        ).then(
            cursor => cursor.all()
        );

    return populatePath(path);
}

async function populatePath(path) {
    const spotifyApi = spotifyApiHolder.getAPI();

    let imagePromises = [];
    let trackPromises = [];
    for (const hop of path) {
        imagePromises.push(spotifyApi.getArtist(hop.id));
        trackPromises.push(spotifyApi.getArtistTopTracks(hop.id, 'US'));
    }

    await Promise.all(imagePromises).then((values) => {
        for (let i = 0; i < path.length; i++) {
            path[i].images = values[i].body.images;
        }
    });

    await Promise.all(trackPromises).then((values) => {
        for (let i = 0; i < path.length; i++) {
            path[i].track = values[i].body.tracks.length > 0 ? values[i].body.tracks[0] : null;
        }
    });

    return path;
}

module.exports = {getShortestPath};

