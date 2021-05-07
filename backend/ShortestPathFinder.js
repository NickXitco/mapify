const arangoDB = require('./ArangoDB');
const spotifyApiHolder = require('./SpotifyAPI');
const artistFinder = require('./ArtistFinder');

/**
 * Gets the shortest path between two points on the graph in the form of an ordered array of hops
 * @param source spotifyID of start point
 * @param target spotifyID of end point
 * @param weighted If "weighted", uses edge weights. Otherwise, computes pure BFS without edge weights
 * @return Array of artist objects
 */
async function getShortestPath(source, target, weighted) {
    const db = arangoDB.getDB();
    const weightingQuery = weighted === "weighted" ? 'OPTIONS {weightAttribute: "weight"}' : '';

    const path = await db.query(
        `
            FOR source IN artists FILTER source.id == '${source}' 
            FOR target IN artists FILTER target.id == '${target}'
            FOR v, e IN OUTBOUND SHORTEST_PATH source TO target GRAPH 'artistGraph' ${weightingQuery} RETURN v
        `
        ).then(
            cursor => cursor.all()
        );

    return populatePath(path);
}

// TODO run findArtist from ArtistFinder on each step of the path, and return those variables

async function populatePath(path) {
    let populationPromises = [];

    for (const hop of path) {
        populationPromises.push(artistFinder.findArtist(hop.id, true));
    }

    await Promise.all(populationPromises).then((values) => {
        for (let i = 0; i < path.length; i++) {
            path[i] = values[i];
        }
    })

    return path;
}

module.exports = {getShortestPath};

