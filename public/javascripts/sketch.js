let canvas = null;
let camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 3);

const MAX_CURVE_ANGLE = 180;

let hoveredArtist = null;
let hoverLoading = false;

let loading = true;

let darkenOpacity = 0;

//let quadCache = new Cache(100);

let quadHead;
let unprocessedResponses = [];

let unloadedQuads = new Set();
let loadingQuads = new Set();
let unloadedQuadsPriorityQueue = new PriorityQueue((a, b) => dist(camera.x, camera.y, a.x, a.y) - dist(camera.x, camera.y, b.x, b.y));

let edgeDrawing = false;
let newEdges = true;
let edges = [];

let nodeLookup = {};
let nodeOccurences = {};

let searchPoint = null;

let infoBox = document.getElementById("infoBox");
let infoBoxArtistName = document.getElementById("infoBoxArtistName");
let infoBoxArtistGenre = document.getElementById("infoBoxArtistGenre");

let searchInput = document.getElementById("searchInput");

searchInput.onchange = async function () {
    if (searchInput.value.length > 3) {
        const url = "artistSearch/" + searchInput.value;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data) {
            if (!nodeLookup.hasOwnProperty(data.id)) {
                nodeLookup[data.id] = new Artist(data.name, data.id, data.followers, data.popularity, data.x, data.y,
                    data.size, color(data.r, data.g, data.b), data.genres, data.related);
            }

            if (!nodeOccurences.hasOwnProperty(data.id)) {
                nodeOccurences[data.id] = 1;
            } else {
                nodeOccurences[data.id]++;
            }

            const node = nodeLookup[data.id];
            searchPoint = node;

            for (const related of node.related) {
                let relatedNode = nodeLookup[related.id];
                if (relatedNode) {
                    node.relatedVertices.push(relatedNode);
                    nodeOccurences[related.id]++;
                } else {
                    let newNode = new Artist(related.name, related.id, related.followers, related.popularity, related.x, related.y,
                        related.size, color(related.r, related.g, related.b), related.genres, related.related);
                    nodeLookup[node.id] = newNode
                    nodeOccurences[node.id] = 1;
                    node.relatedVertices.push(newNode);
                }
            }
            node.loaded = true;
        }
    }
}

let blur;
// noinspection JSUnusedGlobalSymbols
function preload() {
    blur = loadImage('images/blur.png');
}

// noinspection JSUnusedGlobalSymbols
function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    camera.zoomCamera({x: 0, y:0 });

    loadInitialQuads();//TODO loadInitialQuads, probably the first 16? but load the first 128 (or more?) into memory

    angleMode(DEGREES);
    rectMode(RADIUS);
}

async function loadInitialQuads() {
    const response = await fetch('quad/A'); //TODO validation on this response
    const data = await response.json();
    quadHead = new Quad(data.x, data.y, data.r, null, null, "A", null);
    loadingQuads.add(quadHead);
    await quadHead.fetchQuad();
    quadHead.splitDown(4);

    loading = false;
}

// noinspection JSUnusedGlobalSymbols
function draw() {
    if (loading) {
        drawLoading();
        return;
    }

    background(3);
    stroke(255);
    noFill();

    drift(camera);
    zoom();

    if (searchPoint) {
        camera.x = searchPoint.x;
        camera.y = searchPoint.y;
        camera.zoom = Math.sqrt(3.3 * searchPoint.size) - 17;
        camera.zoomCamera({x: camera.x, y: camera.y});

        hoveredArtist = searchPoint;
        edgeDrawing = true;
        newEdges = true;
        searchPoint = null;
    }

    push();
    camera.setView();

    drawOnscreenQuads(quadHead, camera);

    loadUnloaded();

    if (!edgeDrawing) {
        getHoveredArtist();
    }

    if (edgeDrawing && hoveredArtist && !hoveredArtist.loaded && !hoverLoading) {
        loadArtist(hoveredArtist).then();
    }

    if (edgeDrawing) {
        push();
        noStroke();
        fill(color(0, easeOutQuart(darkenOpacity) * 180));
        darkenOpacity = min(darkenOpacity + 0.05, 1);
        rectMode(RADIUS);
        rect(camera.x, -camera.y, camera.width / 2, camera.height / 2);
        pop();
    } else {
        darkenOpacity = 0;
    }

    if (edgeDrawing && hoveredArtist.loaded) {
        drawEdges();
        drawRelatedNodes();
    }

    if (frameCount % 5 === 0) {
        processOne();
    }

    pop();

    drawInfoBox(hoveredArtist);

    Debug.debugAll(camera);
}

function drawRelatedNodes() {
    for (const related of hoveredArtist.relatedVertices) {
        push();
        fill(color(red(related.color), green(related.color), blue(related.color), 127));
        stroke(related.color);
        strokeWeight(related.size / 5);
        circle(related.x, -related.y, related.size);
        pop();
    }
    push();
    fill(0, 200);
    stroke(hoveredArtist.color);
    strokeWeight(hoveredArtist.size / 5);
    circle(hoveredArtist.x, -hoveredArtist.y, hoveredArtist.size);
    pop();
}


function easeOutQuart(x) {
    return 1 - pow(1 - x, 4);
}

async function loadArtist(artist) {
    hoverLoading = true;
    const response = await fetch('artist/' + artist.id);
    const data = await response.json();
    let node = nodeLookup[artist.id]
    if (node) {
        for (const related of data.related) {
            let relatedNode = nodeLookup[related.id];
            if (relatedNode) {
                node.relatedVertices.push(relatedNode);
                nodeOccurences[related.id]++;
            } else {
                let newNode = new Artist(related.name, related.id, related.followers, related.popularity, related.x, related.y,
                    related.size, color(related.r, related.g, related.b), related.genres, related.related);
                nodeLookup[node.id] = newNode
                nodeOccurences[node.id] = 1;
                node.relatedVertices.push(newNode);
            }
        }
        node.loaded = true;
    }
    hoverLoading = false;
}

function drawEdges() {
    if (newEdges) {
        edges = [];
        for (const related of hoveredArtist.relatedVertices) {
            edges.push({
                u: hoveredArtist,
                v: related,
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
        DrawingHelpers.drawEdge(e);
    }
}

function processOne() {
    if (unprocessedResponses.length > 0) {
        const r = unprocessedResponses.pop();
        const q = r.quad;

        let nodes = [];

        for (const node of r.data.nodes) {
            if (!nodeLookup.hasOwnProperty(node.id)) {
                nodeLookup[node.id] = new Artist(node.name, node.id, node.followers, node.popularity, node.x, node.y,
                                                 node.size, color(node.r, node.g, node.b), node.genres, node.related);
            }
            nodes.push(nodeLookup[node.id]);

            if (!nodeOccurences.hasOwnProperty(node.id)) {
                nodeOccurences[node.id] = 1;
            } else {
                nodeOccurences[node.id]++;
            }
        }

        q.nodeQuadTreeFromList(nodes);

        if (q.leaf && !r.data.leaf) {
            q.split();
        }

        if (r.data.image !== "") {
            loadImage('data:image/png;base64, ' + r.data.image, (img) => {
                q.image = img;
                q.loaded = true;
                loadingQuads.delete(quad);
            });
        }

        /*
        let evicted = quadCache.insert(q, q.name);
        if (evicted) {
            evicted.deleteSelf(nodeOccurences, nodeLookup);
        }
         */
    }
}

function loadUnloaded() {
    while (!unloadedQuadsPriorityQueue.isEmpty()) {
        const quad = unloadedQuadsPriorityQueue.pop();
        loadingQuads.add(quad);
        unloadedQuads.delete(quad);
        quad.fetchQuad().then();
    }
}

function drawLoading() {
    //TODO loading screen?
}

const TILE_WIDTH = 1024;
function drawOnscreenQuads(quadHead, camera) {
    let quads = new Set();
    let stack = [];
    stack.push(quadHead);
    const scale = camera.getZoomFactor().x;
    while (stack.length > 0) {
        let q = stack.pop();
        if (camera.contains(q)) {
            if (!q.image) {
                if (!loadingQuads.has(q) && !unloadedQuads.has(q)) {
                    unloadedQuads.add(q);
                    unloadedQuadsPriorityQueue.push(q);
                }
            }
            if ((q.r * 2 * scale) / TILE_WIDTH > 1) {
                if (q.leaf) {
                    while (!q.image && q.name !== "A") {
                        q = q.parent;
                    }
                    quads.add(q);
                } else {
                    stack.push(q.A);
                    stack.push(q.B);
                    stack.push(q.C);
                    stack.push(q.D);
                }
            } else if ((q.r * 2 * scale) / TILE_WIDTH >= 0.5) {
                while (!q.image && q.name !== "A") {
                    q = q.parent;
                }
                quads.add(q);
            }
        }
    }

    push();
    noFill();
    stroke('white');
    for (const q of [...quads].sort((a, b) => a.name.length - b.name.length)) {

        /*
        let evicted = quadCache.insert(q, q.name);
        if (evicted) {
            evicted.deleteSelf(nodeOccurences, nodeLookup);
        }
         */

        if (q.image) {
            noStroke();
            textSize(q.r / 10);
            image(q.image, q.x - q.r, -(q.y + q.r), q.r * 2, q.r * 2, 0, 0);
            fill('white');
            textAlign(CENTER, CENTER);
            //text(q.name, q.x, -q.y);
            textSize(q.r / 20);
            fill('green')
            textAlign(LEFT, TOP);
            //text('Actual Size: (' + q.image.width + ', ' + q.image.height + ')', q.x - q.r, -(q.y + q.r));
            //text('Displayed Size: (' + q.r * 2 * camera.getZoomFactor().x + ', ' + q.r * 2 * camera.getZoomFactor().y + ')', q.x - q.r, -(q.y + q.r * 0.95));
            //text('Number of Nodes Inside: ' + q.renderableNodes.length, q.x - q.r, -(q.y + q.r * 0.90));
            noFill();
            stroke('white');
            strokeWeight(quad.r / 100);
            //rect(q.x, -q.y, q.r, q.r);
        }
    }
    pop();
}

function drawInfoBox(hoveredArtist) {
    if (!hoveredArtist || edgeDrawing) {
        infoBox.style.visibility = "hidden";
        return;
    }
    push();
    const point = camera.virtual2screen({x: hoveredArtist.x, y: hoveredArtist.y});
    infoBox.style.visibility = "visible";
    infoBox.style.borderColor = hoveredArtist.color.toString('rgba%');
    infoBox.style.left = (point.x) + "px";
    infoBox.style.top = (point.y) + "px";

    infoBoxArtistName.innerText = hoveredArtist.name;
    if (hoveredArtist.genres.length > 0) {
        infoBoxArtistGenre.innerText = hoveredArtist.genres[0];
    } else {
        infoBoxArtistGenre.innerText = "";
    }

    const width = Math.max(infoBoxArtistName.clientWidth, infoBoxArtistGenre.clientWidth);
    const height = infoBoxArtistName.clientHeight + infoBoxArtistGenre.clientHeight;

    infoBox.style.width = width + "px";
    infoBox.style.height = height + "px";

    /*
    stroke(hoveredArtist.color);
    strokeWeight(4);
    line(point.x, point.y, point.x + 50, point.y + 50);
    line(point.x, point.y, point.x + 50 + width, point.y + 50 + height);
    line(point.x, point.y, point.x + width + 2, point.y + 52 );
     */

    pop();
}

function getHoveredArtist() {
    let stack = [];
    const mP = getVirtualMouseCoordinates();
    stack.push(quadHead);
    let foundQuad;
    while (stack.length > 0) {
        let q = stack.pop();
        if (q.contains(mP.x, mP.y)) {
            if (q.leaf) {
                while (!q.loaded && q.name !== "A") {
                    q = q.parent;
                }
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

    if (hoveredArtist !== closest) {
        newEdges = true;
    }

    hoveredArtist = closest;
}

window.onresize = function() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    console.log(w);
    console.log(h);
    resizeCanvas(w,h);
    camera.zoomCamera({x: camera.x, y: camera.y});
};