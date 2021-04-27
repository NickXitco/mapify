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
            FOR v, e IN OUTBOUND SHORTEST_PATH source TO target GRAPH 'artistGraph' RETURN v
        `
        ).then(
            cursor => cursor.all()
        );

    return populatePath(path);
}

//TODO
//  When you click on an artist, update the graph database with the new related (if they exist)
//  When you make a shortest path, get the shortest path according to the DB. Then, check if this path is possible
//  by checking each artist on the finished path to see if the artist has the next artist in its real related artists.
//  If so, great! Return the path (while updating the graph db). If not, do it again. This _probably_ won't take that long
//  But if it does, oh well
//  FOR v IN 1 OUTBOUND 'artists/1338256' GRAPH 'artistGraph' RETURN v <--- gets the related artists according to the graph db

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

