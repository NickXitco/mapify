const mongoose = require('mongoose');

async function resolveCamera(camera) {
    const Quad = mongoose.model('Quad');
    const queue = [];
    const renderQuads = {};
    let maxDepth = Infinity;

    const head = await Quad.findOne({name: "A"}).exec();
    queue.push({name: head.name, x: head.x, y: head.y, r: head.r});

    const seen = new Set();

    while (queue.length > 0) {
        const q = queue.shift();
        if (contains(camera, q)) {
            if (fullyContains(camera, q)) {
                const qActual = await Quad.findOne({name: q.name}).exec();
                qActual._doc.fullyContained = true;
                renderQuads[q.name] = qActual;
                if (maxDepth === Infinity) {
                    maxDepth = q.name.length;
                }
                continue;
            }

            const qActual = await Quad.findOne({name: q.name}).exec();
            qActual._doc.fullyContained = false;
            if (qActual.leaf || q.name.length >= maxDepth) {
                renderQuads[q.name] = qActual;
            } else {
                if (!seen.has(q)) {
                    const half = q.r / 2;
                    queue.push({name: q.name + "A", x: q.x - half, y: q.y + half, r: half});
                    queue.push({name: q.name + "B", x: q.x + half, y: q.y + half, r: half});
                    queue.push({name: q.name + "C", x: q.x - half, y: q.y - half, r: half});
                    queue.push({name: q.name + "D", x: q.x + half, y: q.y - half, r: half});

                    queue.push(q);
                    seen.add(q);
                }
            }
        }
    }

    for (const qEntry of Object.keys(renderQuads)) {
        const q = renderQuads[qEntry];
        if (q.image === "") {
            delete renderQuads[qEntry[1]];
            const qUp = await Quad.findOne({name: q.name.slice(0, -1)}).exec();
            if (q._doc.fullyContained === false) {
                qUp._doc.fullyContained = false;
            } else {
                qUp._doc.fullyContained = fullyContains(camera, qUp);
            }
            renderQuads[q.name.slice(0, -1)] = qUp;
        }
    }

    const renderList = [];
    for (const q of Object.values(renderQuads)) {
        renderList.push(q);
    }


    return renderList.sort((a, b) => {
        return b.name.length - a.name.length;
    });
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

/**
 * Containment check for viewport and quad
 * @param camera Camera sent by client
 * @param quad Quad to be checked
 * @returns {boolean} True if the viewport fully contains the quad, false otherwise
 */
function fullyContains(camera, quad) {
    const l2 = {x: quad.x - quad.r, y: quad.y + quad.r};
    const r2 = {x: quad.x + quad.r, y: quad.y - quad.r};

    return pointInView(camera, l2) && pointInView(camera, r2);
}

function pointInView(camera, p) {
    return  p.x <= camera.x + camera.width / 2 && p.x >= camera.x - camera.width / 2 &&
            p.y >= camera.y - camera.height / 2 && p.y <= camera.y + camera.height / 2;
}

module.exports = {resolveCamera};