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

    if (path) {
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


const SPRITE_OFFSET = 1725;

function drawNodes(container, vertices) {
    let i = 0;
    for (const v of vertices) {
        if (i === container.children.length) break;
        const darkerColor = (
            ((v.r / 2) << 16) +
            ((v.g / 2) << 8) +
            (v.b / 2)
        );

        const color = (
            (v.r << 16) +
            (v.g << 8) +
            (v.b)
        );

        const node = container.children[i];
        if (!node.visible) {
            node.x = v.x;
            node.y = -v.y;
            node.scale.x = v.size / SPRITE_OFFSET;
            node.scale.y = v.size / SPRITE_OFFSET;
            node.tint = color;
            node.visible = true;
        }
        i++;
    }
    return i;
}

function undraw(container, index) {
    for (let i = index; i < container.children.length; i++) {
        const node = container.children[i];
        node.visible = false;
    }
}

function drawRelatedNodes(container, clickedArtist) {
    const nodes = [...clickedArtist.relatedVertices];
    nodes.push(clickedArtist)
    return drawNodes(container, nodes);
}

function makeEdges(artist) {
    let edges = [];
    for (const related of artist.relatedVertices) {
        edges.push(makeEdge(artist, related));
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
        segmentsDrawn: 0,
        graphicsHead: new PIXI.Graphics(),
        graphicsTail: new PIXI.Graphics()
    };
}


function drawEdges(camera, edges, clickedArtist, hoveredArtist, uiHover) {
    for (const e of edges) {
        if (hoveredArtist === null || !uiHover || (hoveredArtist === e.v && uiHover)) {
            EdgeDrawer.drawEdge(camera, e);
        } else {
            e.graphicsHead.visible = false;
            e.graphicsTail.visible = false;
        }
    }
}

function drawPathEdges(camera, edges) {
    for (const e of edges) {
        EdgeDrawer.drawEdge(camera, e);
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
    node.tracks = data.tracks;
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
    node.tracks = data.tracks;
    node.loaded = true;
}