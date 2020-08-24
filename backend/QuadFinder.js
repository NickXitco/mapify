const arangoDB = require('./ArangoDB');

async function findQuad(name) {
    const db = arangoDB.getDB();
    return await db.query(
        `FOR q in quads FILTER q.name == \"${name}\" LIMIT 1 RETURN q`
    ).then(
        cursor => cursor.all()
    );
}

module.exports = {findQuad};