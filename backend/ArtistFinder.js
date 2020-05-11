const mongoose = require('mongoose')

async function findArtist(x, y) {
    const Quad = mongoose.model('Quad');
    const Artist = mongoose.model('Artist');
    const queue = [];
    let bottomQuad;

    const head = await Quad.findOne({name: "A"}).exec();
    queue.push({name: head.name, x: head.x, y: head.y, r: head.r});

    while (queue.length > 0) {
        const q = queue.shift();
        if (contains(x, y, q)) {
            const qActual = await Quad.findOne({name: q.name}).exec();
            if (qActual.leaf) {
                bottomQuad = qActual;
            } else {
                const half = q.r / 2;
                queue.push({name: q.name + "A", x: q.x - half, y: q.y + half, r: half});
                queue.push({name: q.name + "B", x: q.x + half, y: q.y + half, r: half});
                queue.push({name: q.name + "C", x: q.x - half, y: q.y - half, r: half});
                queue.push({name: q.name + "D", x: q.x + half, y: q.y - half, r: half});
            }
        }
    }


    let closest = null;
    let closestDistance = Infinity;
    for (const id of bottomQuad.leafNodes) {
        const artist = await Artist.findOne({id: id}).exec();
        const d = distance(x, y, artist.x, artist.y);
        if (d < closestDistance && d < (artist.size / 2)) {
            closest = artist;
            closestDistance = d;
        }
    }

    if (!closest) {
        return {};
    }

    return {
        name: closest.name,
        id: closest.id,
        followers: closest.followers,
        popularity: closest.popularity,
        size: closest.size,
        x: closest.x,
        y: closest.y,
        r: closest.r,
        g: closest.g,
        b: closest.b,
        genres: closest.genres,
        related: closest.related
    };
}

function distance(x1, y1, x2, y2) {
    return Math.hypot((x2 - x1), (y2 - y1));
}

function contains(x, y, q) {
    return  x <= q.x + q.r && x >= q.x - q.r &&
            y >= q.y - q.r && y <= q.y + q.r;
}

module.exports = {findArtist};