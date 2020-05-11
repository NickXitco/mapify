const mongoose = require('mongoose');

async function resolveCamera(camera) {
    const Quad = mongoose.model('Quad');
    const queue = [];
    const renderQuads = [];

    const head = await Quad.findOne({name: "A"}).exec();
    queue.push({name: head.name, x: head.x, y: head.y, r: head.r});

    let bounds = {leftmost: Infinity, rightmost: -Infinity, topmost: -Infinity, bottommost: Infinity};

    while (queue.length > 0) {
        const q = queue.shift();
        if (contains(camera, q)) {
            const relativeScale = getRelativeScale(camera, q);
            const qActual = await Quad.findOne({name: q.name}).exec();
            if (relativeScale > 1) {
                if (qActual.leaf) {
                    updateBounds(bounds, q);
                    renderQuads.push(qActual);
                } else {
                    const half = q.r / 2;
                    queue.push({name: q.name + "A", x: q.x - half, y: q.y + half, r: half});
                    queue.push({name: q.name + "B", x: q.x + half, y: q.y + half, r: half});
                    queue.push({name: q.name + "C", x: q.x - half, y: q.y - half, r: half});
                    queue.push({name: q.name + "D", x: q.x + half, y: q.y - half, r: half});
                }
            } else if (relativeScale >= 0.5) {
                updateBounds(bounds, q);
                renderQuads.push(qActual);
            }
        }
    }

    renderQuads.sort((a, b) => {
        return b.name.length - a.name.length;
    })

    return {renderQuads: renderQuads, bounds: bounds};
}

/**
 * Overlap check for viewport and quad
 * @param camera Camera sent by client
 * @param quad Quad to be checked
 * @returns {boolean} True if the viewport and quad overlap, false otherwise
 */
function contains(camera, quad) {
    const l1 = {x: camera.x - camera.width / 2, y: camera.y + camera.height / 2};
    const r1 = {x: camera.x + camera.width / 2, y: camera.y - camera.height / 2};
    const l2 = {x: quad.x - quad.r, y: quad.y + quad.r};
    const r2 = {x: quad.x + quad.r, y: quad.y - quad.r};

    return !((l1.x >= r2.x || l2.x >= r1.x) || (l1.y <= r2.y || l2.y <= r1.y));
}

const TILE_WIDTH = 1024
function getRelativeScale(camera, quad) {
    return (quad.r * 2 * camera.zoomFactor) / (TILE_WIDTH)
}

function updateBounds(bounds, q) {
    bounds.leftmost = Math.min(bounds.leftmost, q.x - q.r);
    bounds.rightmost = Math.max(bounds.rightmost, q.x + q.r);
    bounds.topmost = Math.max(bounds.topmost, q.y + q.r);
    bounds.bottommost = Math.min(bounds.bottommost, q.y - q.r);
}
module.exports = {resolveCamera};