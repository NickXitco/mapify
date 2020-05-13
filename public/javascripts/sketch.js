let canvas = null;
let camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 3);

const MAX_CURVE_ANGLE = 180;

let hoveredArtist = null;
let infoBoxT = 0;

let loading = true;

let quadHead;
let unprocessedResponses = [];

let unloadedQuads = new Set();
let loadingQuads = new Set();

let edgeDrawing = false;
let edges = [];

let nodeLookup = {};

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
}

async function loadInitialQuads() {
    const response = await fetch('quad/A'); //TODO validation on this response
    const data = await response.json();
    quadHead = new Quad(data.x, data.y, data.r, null, null, "A", null);
    loadingQuads.add(quadHead);
    await quadHead.fetchQuad();
    quadHead.splitDown(4);

    //addUnloadedToList(quadHead);
    loading = false;
}

function addUnloadedToList(quadHead) {
    let stack = [];
    stack.push(quadHead);
    while (stack.length > 0) {
        let q = stack.pop();
        if (!q.image) {
            unloadedQuads.add(q);
        }

        if (!q.leaf) {
            stack.push(q.A);
            stack.push(q.B);
            stack.push(q.C);
            stack.push(q.D);
        }
    }
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

    push();
    drawInfoBox(hoveredArtist);
    camera.setView();

    drawOnscreenQuads(quadHead, camera);
    loadUnloaded();

    if (!edgeDrawing) {
        getHoveredArtist();
    }

    drawEdges();

    if (frameCount % 5 === 0) {
        processOne();
    }
    pop();
    Debug.debugAll(camera);
}

function drawEdges() {
    if (hoveredArtist && edgeDrawing) {
        for (const e of edges) {
            DrawingHelpers.drawEdge(e);
        }
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
        }

        q.nodeQuadTreeFromList(nodes);
        if (r.data.image !== "") {
            q.image = loadImage('data:image/png;base64, ' + r.data.image);
        }
        if (q.leaf && !r.data.leaf) {
            q.split();
        }
        q.loaded = true;
        loadingQuads.delete(quad);
    }
}

function loadUnloaded() {
    for (const quad of unloadedQuads) {
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
                if (!loadingQuads.has(q)) {
                    unloadedQuads.add(q);
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
    rectMode(RADIUS);
    noFill();
    stroke('white');
    for (const q of [...quads].sort((a, b) => a.name.length - b.name.length)) {
        if (q.image) {
            noStroke();
            textSize(q.r / 10);
            image(q.image, q.x - q.r, -(q.y + q.r), q.r * 2, q.r * 2, 0, 0);
            fill('white');
            textAlign(CENTER, CENTER);
            text(q.name, q.x, -q.y);
            textSize(q.r / 20);
            fill('green')
            textAlign(LEFT, TOP);
            text('Actual Size: (' + q.image.width + ', ' + q.image.height + ')', q.x - q.r, -(q.y + q.r));
            text('Displayed Size: (' + q.r * 2 * camera.getZoomFactor().x + ', ' + q.r * 2 * camera.getZoomFactor().y + ')', q.x - q.r, -(q.y + q.r * 0.95));
            text('Number of Nodes Inside: ' + q.renderableNodes.length, q.x - q.r, -(q.y + q.r * 0.90));
            noFill();
            stroke('white');
            strokeWeight(quad.r / 100);
            rect(q.x, -q.y, q.r, q.r);
        }
    }
    pop();
}

function drawInfoBox(hoveredArtist) {
    if (!hoveredArtist) { return; }
    push();
    noStroke();
    fill(0, 200);

    const name = hoveredArtist.name.toUpperCase();
    const genre = (hoveredArtist.genres.length > 0) ? hoveredArtist.genres[0].toUpperCase() : "";
    const boxLength = Math.max(name.length, genre.length);

    beginShape();
    vertex(hoveredArtist.x, -(hoveredArtist.y + 1.2 * hoveredArtist.size / 2));
    vertex(hoveredArtist.x + infoBoxT * boxLength * hoveredArtist.size * 0.5, -(hoveredArtist.y + 1.2 * hoveredArtist.size / 2));
    vertex(hoveredArtist.x + infoBoxT * boxLength * hoveredArtist.size * 0.5, -(hoveredArtist.y - 1.2 * hoveredArtist.size / 2));
    vertex(hoveredArtist.x, -(hoveredArtist.y - 1.2 * hoveredArtist.size / 2));
    bezierVertex(hoveredArtist.x + 0.8 * hoveredArtist.size, -(hoveredArtist.y - 1.2 * hoveredArtist.size / 2),
                 hoveredArtist.x + 0.8 * hoveredArtist.size, -(hoveredArtist.y + 1.2 * hoveredArtist.size / 2),
                     hoveredArtist.x, -(hoveredArtist.y + 1.2 * hoveredArtist.size / 2));
    endShape();

    fill('white');
    textSize(hoveredArtist.size / 2);
    textAlign(LEFT, TOP);
    text(name, hoveredArtist.x + 0.8 * hoveredArtist.size, -(hoveredArtist.y + hoveredArtist.size / 2));
    text(genre, hoveredArtist.x + 0.8 * hoveredArtist.size, -(hoveredArtist.y));

    infoBoxT = min(infoBoxT += 0.1, 1);
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

    hoveredArtist = closest;
}

function rgbToHSB(r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
        diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff === 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return color('hsb(' + Math.round(h * 360) + ', ' + percentRoundFn(s * 100) + '%, ' + percentRoundFn(v * 100) + '%)');
}

function mouseOnNode(data) {
    const mP = getVirtualMouseCoordinates();
    const d = dist(mP.x, mP.y, data.x, data.y);
    return d <= (data.size / 2);

}

function sufficientlyFar(sufficiency, a, b) {
    return Math.hypot(a.x - b.x, a.y-b.y) > sufficiency;
}

window.onresize = function() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    console.log(w);
    console.log(h);
    resizeCanvas(w,h);
    camera.zoomCamera({x: camera.x, y: camera.y});
};