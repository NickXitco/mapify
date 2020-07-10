function getHoveredArtist() {
    if (SearchBox.hoverFlag || Sidebar.hoverFlag) {
        return;
    }

    let stack = [];
    const mP = MouseEvents.getVirtualMouseCoordinates();
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
        let d = dist(mP.x, mP.y, node.x, node.y);
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

function drawNodes(nodeList) {
    for (const node of nodeList) {
        if (camera.containsRegion(node.x, node.y, node.size)) {
            push();
            fill(color(red(node.color), green(node.color), blue(node.color), 127));
            stroke(node.color);
            strokeWeight(node.size / 5);
            circle(node.x, -node.y, node.size);
            pop();
        }
    }
}

function drawRelatedNodes(clickedArtist) {
    drawNodes(clickedArtist.relatedVertices);
    push();
    fill(0, 255);
    stroke(clickedArtist.color);
    strokeWeight(clickedArtist.size / 5);
    circle(clickedArtist.x, -clickedArtist.y, clickedArtist.size);
    pop();
}

function drawEdges(clickedArtist) {
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
        EdgeDrawer.drawEdge(e);
    }
}

async function loadArtistFromSearch(query, isQueryID) {
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

    createNewNode(data);
    let node = nodeLookup[data.id];

    for (const r of data.related) {
        createNewNode(r);
        node.relatedVertices.add(nodeLookup[r.id]);
    }
    node.loaded = true;

    if (!alreadyGot) {
        SearchBox.point = node;
    }

    clickedArtist = node;
    edgeDrawing = true;
}

function createNewNode(data) {
    let exists = true;
    if (!nodeLookup.hasOwnProperty(data.id)) {
        nodeLookup[data.id] = new Artist(data);
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

async function loadArtist(artist) {
    clickedLoading = true;
    const response = await fetch('artist/' + artist.id + "/true");
    const data = await response.json();

    createNewNode(data);
    let node = nodeLookup[data.id];

    for (const r of data.related) {
        createNewNode(r);
        node.relatedVertices.add(nodeLookup[r.id]);
    }
    node.loaded = true;
    clickedLoading = false;
}