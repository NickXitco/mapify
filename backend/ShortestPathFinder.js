const mongoose = require('mongoose');
const neo4j = require('neo4j-driver')

const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "mapify"))
const session = driver.session()
const source = '378dH6EszOLFShpRzAQkVM'
const target = '4QkSD9TRUnMtI8Fq1jXJJe'

/**
 * Gets the shortest path between two points on the graph in the form of an ordered array of hops
 * @param source spotifyID of start point
 * @param target spotifyID of end point
 * @returns {Promise<[]>} Array of spotifyIDs, or empty array if error/no path found
 */
async function getShortestPath(source, target) {
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

    return path
}


async function populatePath(path) {
    const Artist = mongoose.model('Artist');
    let promises = []
    for (const hop of path) {
        promises.push(Artist.findOne({id: hop}).exec());
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
}

getShortestPath(source, target).then((path) => {
    populatePath(path).then( (r) => {
        for (const hop of r) {
            console.log(hop.name);
        }
    })
    driver.close().then();
})

module.exports = {getShortestPath, populatePath};

