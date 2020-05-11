let canvas = null;

let vertices = [];
let edges = [];

let camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 3);

let blur;



const NUM_VERTICES = 256;
const NUM_EDGES = 15;

const MAX_CURVE_ANGLE = 180;

let quadRoot;

let visibleQuads = [];

let quadCache = new Cache(50);

let currentBounds = {leftmost: -Infinity, rightmost: Infinity, topmost: Infinity, bottommost: -Infinity};

let canCreateNewRequest = true;

let previousHoverPoint = {x: Infinity, y: Infinity};
let hoveredArtist = null;
let infoBoxT = 0;

// noinspection JSUnusedGlobalSymbols
function preload() {
    blur = loadImage('images/blur.png');
}

// noinspection JSUnusedGlobalSymbols
function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    colorMode(HSB);
    for (let i = 0; i < NUM_VERTICES; i++) {
        vertices.push(new Vertex(2 * width * (Math.random() - 0.5), 2 * height * (Math.random() - 0.5), Math.random() * 10, color(random(359), random(100), 100)));
    }
    colorMode(RGB);

    quadRoot = new Quad(0, 0, QuadtreeHelpers.radius(vertices), null,  null, "A");
    for (const v of vertices) {
        quadRoot.insert(v);
    }

    camera.zoomCamera({x: 0, y:0 });
    updateVisibleQuads(camera);

    angleMode(DEGREES);
    //testFetch(u);
}

/**
 * The maximum number of nodes on the screen
 * in order to enable glow. This parameter
 * should be changed dynamically, eventually.
 * @type {number}
 */
const GLOW_THRESHOLD = 20;
let doGlow = false;

// noinspection JSUnusedGlobalSymbols
function draw() {
    background(3);
    stroke(255);
    noFill();

    drift(camera);
    zoom();

    push();
    camera.setView();

    if (canCreateNewRequest && necessitatesUpdate(camera, visibleQuads, currentBounds)) {
        updateVisibleQuads(camera);
    }

    drawQuads(quadCache.listify(), true);
    drawQuads(visibleQuads, false);

    getHoveredArtist();
    drawInfoBox(hoveredArtist, infoBoxT);


    //const visibleVertices = QuadtreeHelpers.getVisibleVertices(quadRoot, camera);
    //QuadtreeHelpers.drawQuadtree(quadRoot);
    //highlightedVertex = highlightVertex(quadRoot);

    //doGlow = visibleVertices.length <= GLOW_THRESHOLD;
    //DrawingHelpers.drawEdges(edges);
    //DrawingHelpers.drawVertices(visibleVertices);

    pop();
    Debug.debugAll(camera);
}

function drawInfoBox(hoveredArtist) {
    if (!hoveredArtist) { return; }
    push();
    noStroke();
    fill(0, 200);
    rect(hoveredArtist.x, -(hoveredArtist.y + hoveredArtist.size / 2), infoBoxT * 100, hoveredArtist.size);
    infoBoxT = min(infoBoxT += 0.1, 1);
    pop();
}

function getHoveredArtist() {
    if (!sufficientlyFar(1.5, {x: mouseX, y: mouseY}, previousHoverPoint) || camera.zoom > 10) {
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