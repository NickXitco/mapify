const MAX_CURVE_ANGLE = 180;


function getHoveredArtist(canvas, camera, clickedArtist, quadHead, genre, path, region) {
    let stack = [];
    const mP = MouseEvents.getVirtualMouseCoordinates(canvas, camera);
    stack.push(quadHead);
    let foundQuad;
    while (stack.length > 0) {
        let q = stack.pop();

        if (q.contains(mP.x, mP.y)) {
            if (q.leaf) {
                foundQuad = q;
                break;
            }

            stack.push(q.A);
            stack.push(q.B);
            stack.push(q.C);
            stack.push(q.D);
        }
    }

    if (!foundQuad) {
        return null;
    }

    let closest = null;
    let closestDistance = Infinity;
    for (const node of foundQuad.renderableNodes) {
        let d = Utils.dist(mP.x, mP.y, node.x, node.y);
        if (d < node.size / (5 / 3)) {
            if (d < closestDistance) {
                closest = node;
                closestDistance = d;
            }
        }
    }

    if (clickedArtist) {
        if (clickedArtist.relatedVertices.has(closest) || closest === clickedArtist) {
            return closest;
        } else {
            return null;
        }
    }

    if (genre) {
        if (genre.nodes.has(closest)) {
            return closest;
        } else {
            return null;
        }
    }

    if (path.nodes.length > 0) {
        if (path.nodes.includes(closest)) {
            return closest;
        } else {
            return null;
        }
    }

    if (Utils.fenceComplete(region) && closest) {
        if (Utils.pointInPolygon(closest, region)) {
            return closest;
        } else {
            return null;
        }
    }

    return closest;
}

function drawNodes(container, camera, nodeList) {
    const graphics = new PIXI.Graphics();
    for (const node of nodeList) {
        if (camera.containsRegion(node.x, node.y, node.size)) {
            const darkerColor = (
                ((node.r / 2) << 16) +
                ((node.g / 2) << 8) +
                (node.b / 2)
            );

            const color = (
                (node.r << 16) +
                (node.g << 8) +
                (node.b)
            );

            graphics.beginFill(darkerColor);
            graphics.lineStyle(node.size / 5, color);
            graphics.drawCircle(node.x, -node.y, node.size / 2);
        }
    }
    container.addChild(graphics);
}

function drawRelatedNodes(container, camera, clickedArtist) {
    drawNodes(container, camera, clickedArtist.relatedVertices);
    const graphics = new PIXI.Graphics();

    const darkerColor = (
        ((clickedArtist.r / 6) << 16) +
        ((clickedArtist.g / 6) << 8) +
        (clickedArtist.b / 6)
    );

    const color = (
        (clickedArtist.r << 16) +
        (clickedArtist.g << 8) +
        (clickedArtist.b)
    );

    graphics.beginFill(darkerColor);
    graphics.lineStyle(clickedArtist.size / 5, color);
    graphics.drawCircle(clickedArtist.x, -clickedArtist.y, clickedArtist.size / 2);

    container.addChild(graphics);
}

function makeEdges(artist) {
    let edges = [];
    for (const related of artist.relatedVertices) {
        const u = artist;
        const v = related;
        Math.seedrandom(u.id + v.id);
        edges.push({
            u: u,
            v: v,
            cURad: Math.random() / 2,
            cUAng: Math.random() * MAX_CURVE_ANGLE - MAX_CURVE_ANGLE / 2,
            cVRad: Math.random() / 2,
            cVAng: Math.random() * MAX_CURVE_ANGLE - MAX_CURVE_ANGLE / 2,
            tMax: 0,
            points: [],
        });
    }
    return edges;
}

function makeEdge(u, v) {
    Math.seedrandom(u.id + v.id);
    return {
        u: u,
        v: v,
        cURad: Math.random() / 2,
        cUAng: Math.random() * MAX_CURVE_ANGLE - MAX_CURVE_ANGLE / 2,
        cVRad: Math.random() / 2,
        cVAng: Math.random() * MAX_CURVE_ANGLE - MAX_CURVE_ANGLE / 2,
        tMax: 0,
        points: [],
    };
}


function drawEdges(p, camera, edges, clickedArtist, hoveredArtist, uiHover) {
    for (const e of edges) {
        if (hoveredArtist === null || !uiHover) {
            EdgeDrawer.drawEdge(p, camera, e);
        } else if (hoveredArtist === e.v && uiHover) {
            EdgeDrawer.drawEdge(p, camera, e);
        }
    }
}

function drawPathEdges(p, camera, edges) {
    for (const e of edges) {
        EdgeDrawer.drawEdge(p, camera, e);
        if (e.tMax < 1) {
            break;
        }
    }
}

async function loadArtistFromSearch(query, isQueryID, quadHead, nodeLookup) {
    const response = await fetch('artist/' + query + "/" + isQueryID);
    const data = await response.json();

    if (Object.keys(data).length === 0) {
        return null;
    }

    createNewNode(data, quadHead, nodeLookup);
    let node = nodeLookup[data.id];

    for (const r of data.related) {
        createNewNode(r, quadHead, nodeLookup);
        node.relatedVertices.add(nodeLookup[r.id]);
    }

    node.images = data.images;
    node.track = data.track;
    node.loaded = true;
    return node
}



function createNewNode(data, quadHead, nodeLookup) {
    let exists = true;
    if (!nodeLookup.hasOwnProperty(data.id)) {
        nodeLookup[data.id] = new Artist(data);
        exists = false;
    }

    if (exists) {
        const q = nodeLookup[data.id].quad;
        if (q) {
            q.n = null;
        }
        nodeLookup[data.id].quad = null;
    }
    quadHead.insert(nodeLookup[data.id]);
    return nodeLookup[data.id];
}

async function loadArtist(artist, quadHead, nodeLookup) {
    const response = await fetch('artist/' + artist.id + "/true");
    const data = await response.json();

    createNewNode(data, quadHead, nodeLookup);
    let node = nodeLookup[data.id];

    for (const r of data.related) {
        createNewNode(r, quadHead, nodeLookup);
        node.relatedVertices.add(nodeLookup[r.id]);
    }

    node.images = data.images;
    node.track = data.track;
    node.loaded = true;
}