const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
const spotifyApiHolder = require('./SpotifyAPI');

const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "mapify"))

/**
 * Gets the shortest path between two points on the graph in the form of an ordered array of hops
 * @param source spotifyID of start point
 * @param target spotifyID of end point
 * @returns {Promise<[]>} Array of spotifyIDs, or empty array if error/no path found
 */
async function getShortestPath(source, target) {
    const session = driver.session()
    const result = await session.run(
        'MATCH (start:Artist {spotifyID: $source}) MATCH (end:Artist {spotifyID: $target}) MATCH p=shortestPath((start)-[:RELATED_TO*..50]->(end)) RETURN p',
        {source: source, target: target}
    )

    await session.close()

    const record = result.records[0]
    const path = []

    if (record) {
        const neo4jPath = record.get(0)
        const segments = neo4jPath.segments
        path.push(segments[0].start.properties.spotifyID)
        for (const segment of segments) {
            path.push(segment.end.properties.spotifyID)
        }
    }

    return populatePath(path);
}

async function populatePath(path) {
    const Artist = mongoose.model('Artist');
    const spotifyApi = spotifyApiHolder.getAPI();

    let dBPromises = [];
    let imagePromises = [];
    let trackPromises = [];
    for (const hop of path) {
        dBPromises.push(Artist.findOne({id: hop}).exec());
        imagePromises.push(spotifyApi.getArtist(hop));
        trackPromises.push(spotifyApi.getArtistTopTracks(hop, 'US'));
    }

    let realValues = []
    await Promise.all(dBPromises).then((values) => {
        for (const value of values) {
            if (value) {
                realValues.push({
                    name: value.name,
                    id: value.id,
                    followers: value.followers,
                    popularity: value.popularity,
                    size: value.size,
                    x: value.x,
                    y: value.y,
                    r: value.r,
                    g: value.g,
                    b: value.b,
                    genres: value.genres
                });
            }
        }
    })

    await Promise.all(imagePromises).then((values) => {
        for (let i = 0; i < realValues.length; i++) {
            realValues[i].images = values[i].body.images;
        }
    })

    await Promise.all(trackPromises).then((values) => {
        for (let i = 0; i < realValues.length; i++) {
            realValues[i].track = values[i].body.tracks.length > 0 ? values[i].body.tracks[0] : null;
        }
    })

    return realValues;
}

module.exports = {getShortestPath};

