let canvas = null;

let vertices = [];
let edges = [];

let camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 3);

let blur;

let highlightedVertex;

const NUM_VERTICES = 256;
const NUM_EDGES = 15;

const MAX_CURVE_ANGLE = 180;

let quadRoot;

let visibleQuads = [];

let quadCache = [];

let updating = false;

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

    if (necessitatesUpdate(camera, visibleQuads) && !updating) {
        updating = true;
        updateVisibleQuads(camera);
    }
    drawVisibleQuads(visibleQuads);

    //const visibleVertices = QuadtreeHelpers.getVisibleVertices(quadRoot, camera);
    //QuadtreeHelpers.drawQuadtree(quadRoot);
    //highlightedVertex = highlightVertex(quadRoot);

    //doGlow = visibleVertices.length <= GLOW_THRESHOLD;
    //DrawingHelpers.drawEdges(edges);
    //DrawingHelpers.drawVertices(visibleVertices);

    pop();
    Debug.debugAll(camera);
}


function necessitatesUpdate(camera, visibleQuads) {

    /* TODO
        This is a silly way and a non accurate way of representing this.
        What we should really be doing is, if the width(/height) of the image as displayed on the screen
        is greater than that of the actual image (i.e., the image is being scaled up), then we should
        load the next quads.
        Likewise, if we measure the image as displayed on the screen to be half as large as the actual image,
        we should unload those 4 quads and load the larger one.
     */

    for (const quad of visibleQuads) {
        if (quad.fullyContained && !fullyContains(camera, quad)) {
            return true;
        } else if (!quad.fullyContained && fullyContains(camera, quad)) {
            return true;
        }
    }
    return false;
}

function fullyContains(camera, quad) {
    const l2 = {x: quad.x - quad.r, y: quad.y + quad.r};
    const r2 = {x: quad.x + quad.r, y: quad.y - quad.r};

    return pointInView(camera, l2) && pointInView(camera, r2);
}

function pointInView(camera, p) {
    return  p.x <= camera.x + camera.width / 2 && p.x >= camera.x - camera.width / 2 &&
            p.y >= camera.y - camera.height / 2 && p.y <= camera.y + camera.height / 2;
}

function updateVisibleQuads(camera) {

    /* TODO
        If we get a bad/no response from the fetch, don't update visible quads, or else we'll get a blank screen.
     */
    const url = 'quads' + '/' + camera.x + '/' + camera.y + '/' + camera.width + '/' + camera.height;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let temp = [];
            for (const q of data) {
                const cached = getCached(q);
                if (cached === null) {
                    const newQuad = {name: q.name, x: q.x, y: q.y, r: q.r, image: loadImage('data:image/png;base64, ' + q.image), fullyContained: q.fullyContained};
                    temp.push(newQuad);
                    quadCache.push(newQuad);
                } else {
                    temp.push(cached);
                }
            }
            visibleQuads = temp;
            updating = false;
        });
}

function getCached(q) {
    for (const quad of quadCache) {
        if (quad.name === q.name) {
            return quad;
        }
    }
    return null;
}

function drawVisibleQuads(visibleQuads) {
    push();
    textAlign(CENTER, CENTER);
    for (const q of visibleQuads) {
        noStroke();
        textSize(q.r / 10);
        image(q.image, q.x - q.r, -(q.y + q.r), q.r * 2, q.r * 2, 0, 0);
        fill('white');
        text(q.name, q.x, -q.y);
        noFill();
        stroke('white');
        rect(q.x - q.r, -(q.y + q.r), q.r * 2, q.r * 2);
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