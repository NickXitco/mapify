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
        a.geo = gnomicProjection(a.x, a.y, 0, -0.5 * Math.PI, radius);
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
        UPDATE a WITH { _key: a._key, geo: [${a.geo.longitude}, ${a.geo.latitude}] } IN artists
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

/***
 * Calculates the inverse of the gnomic projection of a plane onto a unit sphere
 * @param x x-coordinate of input point on plane
 * @param y y-coordinate of input point on plane
 * @param lambda0 - central longitude of projection
 * @param phi1 - central latitude of projection
 * @param r - max radius of plane
 * @return {{latitude: number, longitude: number}}
 */
function gnomicProjection(x, y, lambda0, phi1, r) {
    const X = x / r;
    const Y = y / r;
    const p = Math.hypot(X, Y);
    const c = Math.atan(p);
    
    const sinPhi1 = Math.sin(phi1);
    const cosPhi1 = Math.cos(phi1);
    const cosC = Math.cos(c);
    const sinC = Math.sin(c);

    let lat, long;

    if (p === 0) {
        lat = Math.asin(cosC * sinPhi1);
    } else {
        lat = Math.asin(cosC * sinPhi1 + ((Y * sinC * cosPhi1) / p));
    }

    long = lambda0 + Math.atan2(X * sinC, (p * cosPhi1 * cosC) - (Y * sinPhi1 * sinC));

    return {
        latitude: lat * (180 / Math.PI),
        longitude: long * (180 / Math.PI)
    }
}
