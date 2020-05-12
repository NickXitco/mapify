let canvas = null;

let camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 3);

let blur;

const NUM_VERTICES = 256;
const NUM_EDGES = 15;

const MAX_CURVE_ANGLE = 180;

let visibleQuads = [];

let quadCache = new Cache(50);

let currentBounds = {leftmost: -Infinity, rightmost: Infinity, topmost: Infinity, bottommost: -Infinity};

let canCreateNewRequest = true;

let previousHoverPoint = {x: Infinity, y: Infinity};
let hoveredArtist = null;
let infoBoxT = 0;

let loading = true;

let quadHead;

let unprocessedResponses = [];

let unloadedQuads = new Set();
let loadingQuads = new Set();

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
    await quadHead.fetchImage();
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
    camera.setView();

    /* TODO draw quads on screen
        - These should be pulled from memory, always
        - We should constantly be trying to expand the quadtree and load quads and quad images into memory
        - Quad images should go in a cache, so that images offscreen and not having been loaded in a while
          can be unloaded
        - We should aim to make requests for single quads, and if we make requests for multiple quads, to not
          load them all at once.
        - Do not update a cache or any complex data structure asynchronously, this always causes problems,
          any updates to a data structure should be done in the draw loop, and should be loading from a
          list that can be updated synchronously safely.
     */

    /*
    if (canCreateNewRequest && necessitatesUpdate(camera, visibleQuads, currentBounds)) {
        updateVisibleQuads(camera);
    }
     */

    drawOnscreenQuads(quadHead, camera);
    loadUnloaded();

    if (frameCount % 5 === 0) {
        processOne();
    }
    pop();
    Debug.debugAll(camera);
}

function processOne() {
    if (unprocessedResponses.length > 0) {
        const r = unprocessedResponses.pop();
        const q = r.quad;
        if (r.data.image !== "") {
            q.image = loadImage('data:image/png;base64, ' + r.data.image);
        }
        if (q.leaf && !r.data.leaf) {
            q.split();
        }
        loadingQuads.delete(quad);
    }
}

function loadUnloaded() {
    for (const quad of unloadedQuads) {
        loadingQuads.add(quad);
        unloadedQuads.delete(quad);
        quad.fetchImage().then();
    }
}

function drawLoading() {

}

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
    for (const q of [...quads].sort((a, b) => a.name.length - b.name.length)) { //TODO may not even need to sort this, since set preserves insertion order
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

    //rect(hoveredArtist.x, -(hoveredArtist.y + 1.2 * hoveredArtist.size / 2), infoBoxT * 100, hoveredArtist.size * 1.2);
    infoBoxT = min(infoBoxT += 0.1, 1);
    pop();
}

function getHoveredArtist() {
    if (!sufficientlyFar(10, {x: mouseX, y: mouseY}, previousHoverPoint) || camera.zoom > 1) {
        return;
    }
    infoBoxT = 0;
    previousHoverPoint = {x: mouseX, y: mouseY};
    const point = getVirtualMouseCoordinates();
    const url = 'artist' + '/' + point.x + '/' + point.y;
    fetch(url).then(response => {
        if (response.status === 200) {
            response.json().then(data => {
                if (Object.keys(data)[0]) {
                    hoveredArtist = data;
                } else {
                    hoveredArtist = null;
                }
            });
        }
    });
}

function sufficientlyFar(sufficiency, a, b) {
    return Math.hypot(a.x - b.x, a.y-b.y) > sufficiency;
}

const TILE_WIDTH = 1024;
function necessitatesUpdate(camera, visibleQuads, currentBounds) {
    if (checkBounds(camera, currentBounds)) {
        return true;
    }

    for (const quad of visibleQuads) {
        const relativeScale = (quad.r * 2 * camera.getZoomFactor().x) / (TILE_WIDTH);
        if (relativeScale < 0.5 || relativeScale > 1) {
            return true;
        }
    }
    return false;
}

function checkBounds(camera, currentBounds) {
    if (currentBounds.leftmost >= camera.x - camera.width / 2 && currentBounds.leftmost > -27496) { return true; }
    if (currentBounds.rightmost <= camera.x + camera.width / 2 && currentBounds.rightmost < 27496) { return true; }
    if (currentBounds.topmost <= camera.y + camera.height / 2 && currentBounds.topmost < 27496) { return true; }
    if (currentBounds.bottommost >= camera.y - camera.height / 2 && currentBounds.bottommost > -27496) { return true; }
    return false;
}

function updateVisibleQuads(camera) {
    const url = 'quads' + '/' + camera.x + '/' + camera.y + '/' + camera.width + '/' + camera.height + '/' + camera.getZoomFactor().x;
    canCreateNewRequest = false;
    fetch(url).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    let temp = [];
                    for (const q of data.renderQuads) {
                        const cached = quadCache.get(q);
                        if (!cached) {
                            const image = (q.image !== "") ? loadImage('data:image/png;base64, ' + q.image) : null;
                            const newQuad = {name: q.name, x: q.x, y: q.y, r: q.r, image: image, fullyContained: q.fullyContained};
                            temp.push(newQuad);
                        } else {
                            temp.push(cached);
                        }
                    }

                    for (const q of temp) {
                        quadCache.insert(q, q.name);
                    }

                    currentBounds = data.bounds;
                    visibleQuads = temp;
                });
            }
            canCreateNewRequest = true;
        });
}

function drawQuads(quads, skipVisible) {
    push();
    for (const q of quads) {
        if (skipVisible && visibleQuads.includes(q.name)) { continue; }
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
            noFill();
            stroke('white');
            rect(q.x - q.r, -(q.y + q.r), q.r * 2, q.r * 2);
        }
    }
    pop();
}

window.onresize = function() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    console.log(w);
    console.log(h);
    resizeCanvas(w,h);
    camera.zoomCamera({x: camera.x, y: camera.y});
};