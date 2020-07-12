const MAX_CURVE_ANGLE = 180;

//TODO return hoveredArtist
function getHoveredArtist(p, quadHead) {
    if (SearchBox.hoverFlag || Sidebar.hoverFlag) {
        return;
    }

    let stack = [];
    const mP = MouseEvents.getVirtualMouseCoordinates(p);
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
        hoveredArtist = null;
        return;
    }

    /*
    let evicted = quadCache.insert(foundQuad, foundQuad.name);
    if (evicted) {
        evicted.deleteSelf(nodeOccurences, nodeLookup);
    }
     */

    let closest = null;
    let closestDistance = Infinity;
    for (const node of foundQuad.renderableNodes) {
        let d = Utils.dist(mP.x, mP.y, node.x, node.y);
        if (d < node.size / 2) {
            if (d < closestDistance) {
                closest = node;
                closestDistance = d;
            }
        }
    }

    if (clickedArtist) {
        if (clickedArtist.relatedVertices.has(closest) || closest === clickedArtist) {
            hoveredArtist = closest;
        } else {
            hoveredArtist = null;
            return;
        }
    }

    if (GenreHelpers.genreNodes.size > 0) {
        if (GenreHelpers.genreNodes.has(closest)) {
            hoveredArtist = closest;
        } else {
            hoveredArtist = null;
            return;
        }
    }

    hoveredArtist = closest;
}

function drawNodes(p, nodeList) {
    for (const node of nodeList) {
        if (camera.containsRegion(node.x, node.y, node.size)) {
            p.push();
            p.strokeWeight(node.size / 5);
            p.fill(p.color(p.red(node.color), p.green(node.color), p.blue(node.color), 127));
            p.stroke(node.color);
            p.circle(node.x, -node.y, node.size);
            p.pop();
        }
    }
}

function drawRelatedNodes(p, clickedArtist) {
    drawNodes(p, clickedArtist.relatedVertices);
    p.push();
    p.fill(0, 255);
    p.stroke(clickedArtist.color);
    p.strokeWeight(clickedArtist.size / 5);
    p.circle(clickedArtist.x, -clickedArtist.y, clickedArtist.size);
    p.pop();
}

function drawEdges(p, clickedArtist) {
    if (newEdges) {
        edges = [];
        for (const related of clickedArtist.relatedVertices) {
            const u = clickedArtist;
            const v = related;
            Math.seedrandom(u.id + v.id);
            edges.push({
                u: u,
                v: v,
                cUrad: Math.random() / 2,
                cUang: Math.random() * MAX_CURVE_ANGLE - MAX_CURVE_ANGLE / 2,
                cVrad: Math.random() / 2,
                cVang: Math.random() * MAX_CURVE_ANGLE - MAX_CURVE_ANGLE / 2,
                tMax: 0
            });
        }
        newEdges = false;
    }

    for (const e of edges) {
        if (!(hoveredArtist !== null && hoveredArtist !== clickedArtist && hoveredArtist !== e.v)) {
            EdgeDrawer.drawEdge(p, e);
        }
    }
}

async function loadArtistFromSearch(p, query, isQueryID, quadHead, nodeLookup) {
    let alreadyGot = false;
    if (isQueryID) {
        const cachedNode = nodeLookup[query];
        if (cachedNode) {
            SearchBox.point = cachedNode;
            alreadyGot = true;
        }
    }

    const response = await fetch('artist/' + query + "/" + isQueryID);
    const data = await response.json();

    if (Object.keys(data).length === 0) {
        return;
    }

    createNewNode(p, data, quadHead, nodeLookup);
    let node = nodeLookup[data.id];

    for (const r of data.related) {
        createNewNode(p, r, quadHead, nodeLookup);
        node.relatedVertices.add(nodeLookup[r.id]);
    }
    node.loaded = true;

    if (!alreadyGot) {
        SearchBox.point = node;
    }

    clickedArtist = node;
    edgeDrawing = true;
}

function createNewNode(p, data, quadHead, nodeLookup) {
    let exists = true;
    if (!nodeLookup.hasOwnProperty(data.id)) {
        nodeLookup[data.id] = new Artist(p, data);
        exists = false;
    }

    if (!nodeOccurences.hasOwnProperty(data.id)) {
        nodeOccurences[data.id] = 1;
    } else {
        nodeOccurences[data.id]++;
    }

    if (exists) {
        const q = nodeLookup[data.id].quad;
        if (q) {
            q.n = null;
        }
        nodeLookup[data.id].quad = null;
    }
    quadHead.insert(nodeLookup[data.id]);
}

async function loadArtist(p, artist, quadHead, nodeLookup) {
    clickedLoading = true;
    const response = await fetch('artist/' + artist.id + "/true");
    const data = await response.json();

    createNewNode(p, data, quadHead, nodeLookup);
    let node = nodeLookup[data.id];

    for (const r of data.related) {
        createNewNode(p, r, quadHead, nodeLookup);
        node.relatedVertices.add(nodeLookup[r.id]);
    }
    node.loaded = true;
    clickedLoading = false;
}