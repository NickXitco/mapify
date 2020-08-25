const arangoDB = require('./ArangoDB');

async function findQuad(name) {
    const db = arangoDB.getDB();
    return await db.query(
        `
        FOR q IN quads
        FILTER q.name == "${name}"
        LIMIT 1
        LET nodes = (
          FOR a IN artists
            FILTER a.id IN q.nodes
            RETURN a
        )
        RETURN {
            name: q.name,
            x: q.x,
            y: q.y,
            r: q.r,
            image: q.image,
            leaf: q.leaf,
            nodes: nodes
            }
        `
    ).then(
        cursor => cursor.all()
    );
}

module.exports = {findQuad};