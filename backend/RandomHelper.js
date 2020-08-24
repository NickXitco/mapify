const arangoDB = require('./ArangoDB');

async function getRandomNode() {
    const db = arangoDB.getDB();
    return await db.query(
        `
        FOR a IN artists
          SORT RAND()
          LIMIT 1
          RETURN a
        `
    ).then(
        cursor => cursor.all()
    );
}

module.exports = {getRandomNode};

