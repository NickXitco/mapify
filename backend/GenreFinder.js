const arangoDB = require('./ArangoDB');

async function findGenre(name) {
    const db = arangoDB.getDB();
    return await db.query(
        `
        FOR g IN genres
          FILTER g.name == "${name}"
          LIMIT 1
          LET nodes = (
              FOR a IN artists
                FILTER g.name IN a.genres
                SORT a.followers DESC
                RETURN a
          )
          RETURN {
                name: g.name,
                artists: nodes,
                r: g.r,
                g: g.g,
                b: g.b
                }
        `
    ).then(
        cursor => cursor.all()
    );
}

module.exports = {findGenre};