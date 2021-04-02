const arangoDB = require('./ArangoDB');

runLatLong().then();

async function runLatLong() {
    let artists = [];
    let radius = 0;
    for (const a of await getAllArtists()) {
        radius = Math.max(radius, Math.abs(a.x), Math.abs(a.y));
        artists.push(a);
    }

    radius += 100 //Don't want anything too close to the border for precision issues

    for (const a of artists) {
        const geo = calculateLatLong(a.x, a.y, radius);

        if (Math.abs(geo[0]) > 180) {
            console.log(`Out of bounds longitude! Artist ${a}`);
        }

        if (Math.abs(geo[1]) > 90) {
            console.log(`Out of bounds latitude! Artist ${a}`);
        }

        a.geo = geo
    }

    for (const a of artists) {
        updateArtist(a).then();
    }
}

async function updateArtist(a) {
    const db = arangoDB.getDB();
    const query = (
        `
        FOR a in artists
        FILTER a._key == "${a.key}"
        UPDATE a WITH { _key: a._key, geo: [${a.geo[0]}, ${a.geo[1]}] } IN artists
        RETURN NEW.geo
        `
    )
    return db.query(
        query
    ).then(
        cursor => cursor.all()
    );
}

function getAllArtists() {
    const db = arangoDB.getDB();
    return db.query(
        `FOR a in artists RETURN { "key": a._key, "x": a.x, "y": a.y}`
    ).then(
        cursor => cursor.all()
    );
}


function calculateLatLong(x, y, r) {
    // Map x, y to the unit circle by dividing by the radius of the plane
    const X = (x / r);
    const Y = (y / r);

    // Perform stereographic projection on (X, Y) to (X', Y', Z')
    const projX = (2 * X) / (1 + X * X + Y * Y);
    const projY = (2 * Y) / (1 + X * X + Y * Y);
    const projZ = (-1 + X * X + Y * Y) / (1 + X * X + Y * Y);

    const lat = ((Math.PI / 2) - Math.acos(projZ)) * (180 / Math.PI);
    const long = (Math.atan2(projY, projX) * (180 / Math.PI));

    return [long, lat]; //Ordered for RFC 7946 Position
}
