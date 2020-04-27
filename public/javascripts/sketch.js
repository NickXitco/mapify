let canvas = null;
let zoom = 1;

let vertices = [];

let camera = {x: 0, y: 0, height: window.innerHeight, width: window.innerWidth};

let blur;

let A_BITMAP;
let B_BITMAP;
let C_BITMAP;
let D_BITMAP;

// noinspection JSUnusedGlobalSymbols
function preload() {
    blur = loadImage('images/blur.png');
    A_BITMAP = loadImage('images/AADBBCDADA.png');
    B_BITMAP = loadImage('images/AADBBCDADB.png');
    C_BITMAP = loadImage('images/AADBBCDADC.png');
    D_BITMAP = loadImage('images/AADBBCDADD.png');
}

const NUM_VERTICES = 4096;

let QUAD_HEAD;

// noinspection JSUnusedGlobalSymbols
function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    for (let i = 0; i < NUM_VERTICES; i++) {
        colorMode(HSB);
        vertices.push(new Vertex(2 * width * (Math.random() - 0.5), 2 * height * (Math.random() - 0.5), Math.random() * 10, color(random(359), random(100), 100)));
    }
    colorMode(RGB);

    QUAD_HEAD = new Quad(0, 0, radius(), null,  null, "A");
    for (const v of vertices) {
        QUAD_HEAD.insert(v);
    }
}

function radius() {
    let r = 0;
    for (const v of vertices) {
        r = max(abs(v.x), abs(v.y), r);
    }
    return r;
}

/**
 * The maximum number of nodes on the screen
 * in order to enable glow. This parameter
 * should be changed dynamically, eventually.
 * @type {number}
 */
const GLOW_THRESHOLD = 25;
let doGlow = false;

// noinspection JSUnusedGlobalSymbols
function draw() {
    background(3);
    stroke(255);
    noFill();



    //drawScreenCrosshairs();
    printMouseCoordinates();
    drift();
    debugCamera();
    printFPS();
    setView();
    drawCrosshairs();



    const visibleVertices = getVisibleVertices();
    //drawQuadtree();
    HIGHLIGHTED = highlightVertex();

    doGlow = visibleVertices.length <= GLOW_THRESHOLD;

    for (const v of visibleVertices) {
        glowCircle(v);
        nodeText(v);
        v.visible = false;
    }
    testDrawBitmaps();
}

function testDrawBitmaps() {
    const dim = QUAD_HEAD.r;
    image(A_BITMAP, -dim, -dim, dim, dim, 0, 0);
    image(B_BITMAP, 0, -dim, dim, dim, 0, 0);
    image(C_BITMAP, -dim, 0, dim, dim, 0, 0);
    image(D_BITMAP, 0, 0, dim, dim, 0, 0);
}

/**
 * 0.5 is "correct", anything greater will render more outside the viewport,
 * anything less will render only a percentage of the viewport.
 * There are many, many optimizations to be made just in the way that we handle
 * this parameter. However, the total view amount should always be at least 0.5,
 * because we need to be able to render nodes who's own circle rendering falls
 * outside their quad.
 *
 * For example:
 *
 *   We could have the view amount always stay at 0.5, but also declare a
 *   VIEW_OFFSET sort of variable that adds a constant amount of view to the
 *   outside of the frame. We could make that constant equal to the largest
 *   node in the dataset, which would always ensure that every node is in view.
 *
 * @type {number}
 */
const VIEW_AMOUNT = 0.55

function getVisibleVertices() {
    const nodes = QUAD_HEAD.getNodesInRange({x: camera.x - VIEW_AMOUNT * camera.width,
                                                y: camera.y + VIEW_AMOUNT * camera.height},
                                            {x: camera.x + VIEW_AMOUNT * camera.width,
                                                y: camera.y - VIEW_AMOUNT * camera.height});
    for (const n of nodes) {
        n.visible = true;
    }
    return nodes;
}

/**
 * The radius of the cursor. This is in order to deal with selecting nodes
 * that are bigger than the quads the contain them. Eventually, this
 * should be exactly equal to the radius of the largest node in the dataset.
 *
 * If you ever are trying to select a node and it's not working, this might be a cause.
 * @type {number}
 */
const POINTER_SIZE = 10;
let HIGHLIGHTED;
function highlightVertex() {
    const mP = getVirtualMouseCoordinates();
    const nodes = QUAD_HEAD.getNodesInRange({x: mP.x - 0.5 * POINTER_SIZE,
                                                y: mP.y + 0.5 * POINTER_SIZE},
                                            {x: mP.x + 0.5 * POINTER_SIZE,
                                                y: mP.y - 0.5 * POINTER_SIZE});

    push();
    fill(255, 0.5);
    rectMode(RADIUS);
    //rect(mP.x, -mP.y, POINTER_SIZE); //TODO debug, remove
    pop();

    if (nodes.length === 0) {
        HIGHLIGHTED = null;
        return;
    }
    let h;
    let hD = Infinity;
    for (const n of nodes) {
        let d = dist(mP.x, mP.y, n.x, n.y);
        if (d < hD && d <= n.size / 2) {
            h = n;
            hD = d;
        }
    }

    if (h === undefined) {
        HIGHLIGHTED = null;
        return;
    }
    return h;
}


function drawQuadtree() {
    push();
    rectMode(RADIUS);
    let quads = [];
    quads.push(QUAD_HEAD);

    while (quads.length > 0) {
        const q = quads.pop();
        if (q.A !== undefined) quads.push(q.A);
        if (q.B !== undefined) quads.push(q.B);
        if (q.C !== undefined) quads.push(q.C);
        if (q.D !== undefined) quads.push(q.D);

        if (q.n !== null && q.n.visible) stroke("white");
        else continue;

        rect(q.x, -q.y, q.r, q.r);
        push();
        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(q.r);
        text(q.direction, q.x, -q.y);
        pop();
    }
    pop();
}

const BLUR_SIZE = 2.27
function glowCircle(v) {
    push();
    stroke(v.color);
    strokeWeight(0.15 * v.size);
    if (doGlow) {
        tint(v.color);
        image(blur, v.x - BLUR_SIZE * 0.5 * v.size,
                  - v.y - BLUR_SIZE * 0.5 * v.size,
                 BLUR_SIZE * v.size,
                 BLUR_SIZE *  v.size, 0, 0);
    }

    if (HIGHLIGHTED === v) {
        let h = v.color.levels;
        console.log(h);
        fill(h[0], h[1], h[2], 75);
    }
    circle(v.x, -v.y, v.size);
    pop();
}

const TEXT_DRAW_THRESHOLD = 7.5;
const TEXT_OFFSET = 0.25;
function nodeText(v) {
    const zF = getZoomFactor();

    if (zF.x * (v.size / 2) < TEXT_DRAW_THRESHOLD) {
        return;
    }

    push();
    noStroke();
    fill(255);
    textSize(v.size / 2);
    textAlign(CENTER);
    text(v.text, v.x, - v.y + v.size + v.size * TEXT_OFFSET);
    pop();
}

function screen2virtual(point) {
    let x = point.x;
    let y = point.y;
    x = map(x, 0, width, camera.x - (camera.width / 2), camera.x + (camera.width / 2));
    y = map(y, 0, height, camera.y + (camera.height / 2), camera.y - (camera.height / 2));
    return {x: x, y: y};
}

function getVirtualMouseCoordinates() {
    // noinspection JSUnresolvedVariable
    return screen2virtual({x: mouseX, y: mouseY});
}

function map(n, a, b, c, d) {
    return (n - a) / (b - a) * (d - c) + c;
}

function printMouseCoordinates() {
    let mP = getVirtualMouseCoordinates();
    push();
    translate(0, 0);
    scale(1);
    fill("lime");
    noStroke();
    text(mP.x, 10, 25);
    text(mP.y, 10, 50);
    pop();
}

function drawScreenCrosshairs() {
    push();
    strokeWeight(1);
    stroke("aqua");
    line(width / 2, 0, width / 2, height);
    line(0, height / 2, width, height / 2);
    pop();
}

function drawCrosshairs() {
    push();
    strokeWeight(3);
    stroke("lime");
    line(0, 10, 0, -10);
    line(-10, 0, 10, 0);
    pop();
}

function printFPS() {
    push();
    let fps = frameRate();
    fill(255);
    stroke(0);
    text("FPS: " + fps.toFixed(2), 10, height - 10);
    pop();
}

function debugCamera() {
    push();
    translate(0, 0);
    scale(1);
    fill("lime");
    noStroke();
    text("Camera Center: (" + camera.x + ", " + camera.y + ")", 10, 75);
    text("Camera Width: " + camera.width, 10, 100);
    text("Camera Height: " + camera.height, 10, 125);
    pop();
}

// noinspection JSUnusedGlobalSymbols
function mouseWheel(e) {
    zoom += e.delta / 100;
    zoomCamera(getVirtualMouseCoordinates(), zoom);
}

/**
 * Updates the view based on the global "camera"
 */
function setView() {
    const zoomFactor = getZoomFactor();
    translate(width / 2 - (camera.x * zoomFactor.x), height / 2 + (camera.y * zoomFactor.y));
    scale(zoomFactor.x, zoomFactor.y);
}

function getZoomFactor() {
    return {x: width /  camera.width, y: height / camera.height};
}

function zoomCamera(toward, zoom) {
    const oldHeight = camera.height;
    const oldWidth = camera.width;
    if (zoom > 0) {
        camera.height = height * ((zoom - 1) / 2 + 1);
        camera.width = width * ((zoom - 1) / 2 + 1);
    } else {
        camera.height = height * (0.5 / Math.pow(2, -0.25 * zoom));
        camera.width = width * (0.5 / Math.pow(2, -0.25 * zoom));
    }

    const pos = calculateZoomPos(toward, oldWidth, oldHeight);
    camera.x = pos.x;
    camera.y = pos.y;
}

function calculateZoomPos(toward, oldWidth, oldHeight) {
    const x = ((camera.x - toward.x)/ oldWidth) * camera.width + toward.x;
    const y = ((camera.y - toward.y)/ oldHeight) * camera.height + toward.y;
    return {x: x, y: y};
}

let dragging = false;
let drag; //stored as screen coordinates

const DRIFT_THRESHOLD = 0.1;
let drifting = false;
let driftVec = null;

function drift() {
    if (drifting) {
        if (driftVec.mag() < DRIFT_THRESHOLD) {
            drifting = false;
            return;
        }
        driftVec.div(1.1);
        camera.x -= driftVec.x * (camera.width / width);
        camera.y += driftVec.y * (camera.height / height);
    }
}

function mousePressed() {
    dragging = true;
    drag = {x: mouseX, y: mouseY};
}

function mouseDragged() {
    if (dragging) {
        const newDrag = getVirtualMouseCoordinates();
        const oldDrag = screen2virtual(drag);
        camera.x += (oldDrag.x - newDrag.x);
        camera.y += (oldDrag.y - newDrag.y);
        drag = {x: mouseX, y: mouseY};
    }
}

function mouseReleased() {
    const newDrag = getVirtualMouseCoordinates();
    const oldDrag = screen2virtual(drag);
    camera.x += (oldDrag.x - newDrag.x);
    camera.y += (oldDrag.y - newDrag.y);

    driftVec = createVector(winMouseX - pwinMouseX, winMouseY - pwinMouseY);
    drifting = true;
    dragging = false;
}

window.onresize = function() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    console.log(w);
    console.log(h);
    resizeCanvas(w,h);
    zoomCamera({x: camera.x, y: camera.y}, zoom);
};