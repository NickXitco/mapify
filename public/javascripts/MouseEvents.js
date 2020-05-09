/**
 * Helper file to hold all global mouse events
 * to help separate from drawing.
 */
let dragging = false;
let drag; //stored as screen coordinates

const DRIFT_THRESHOLD = 0.1;
let drifting = false;
let driftVec = null;

let scrollDelta = 0;
let scrollStep = 0;
let zooming;
let zoomCoordinates;

// noinspection JSUnusedGlobalSymbols
function mouseWheel(e) {
    zooming = true;
    scrollDelta = e.delta / 300;
    scrollStep = 0;
    zoomCoordinates = getVirtualMouseCoordinates();
}

const SCROLL_STEPS = 8;
function zoom() {
    if (zooming) {
        scrollStep++;
        camera.zoom += scrollDelta / SCROLL_STEPS;
        camera.zoom = min(camera.zoom, 8.5);
        camera.zoomCamera(zoomCoordinates);
        if (scrollStep === SCROLL_STEPS) {
            zooming = false;
            scrollStep = 0;
        }
    }
}



// noinspection JSUnusedGlobalSymbols
function mousePressed() {
    dragging = true;
    drag = {x: mouseX, y: mouseY};
}

// noinspection JSUnusedGlobalSymbols
function mouseDragged() {
    if (dragging) {
        const newDrag = getVirtualMouseCoordinates();
        const oldDrag = camera.screen2virtual(drag);
        camera.x += (oldDrag.x - newDrag.x);
        camera.y += (oldDrag.y - newDrag.y);
        drag = {x: mouseX, y: mouseY};
    }
}

// noinspection JSUnusedGlobalSymbols
function mouseReleased() {
    const newDrag = getVirtualMouseCoordinates();
    const oldDrag = camera.screen2virtual(drag);
    camera.x += (oldDrag.x - newDrag.x);
    camera.y += (oldDrag.y - newDrag.y);

    driftVec = createVector(winMouseX - pwinMouseX, winMouseY - pwinMouseY);
    drifting = true;
    dragging = false;
}

function drift(camera) {
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

/**
 * The radius of the cursor. This is in order to deal with selecting nodes
 * that are bigger than the quads the contain them. Eventually, this
 * should be exactly equal to the radius of the largest node in the dataset.
 *
 * If you ever are trying to select a node and it's not working, this might be a cause.
 * @type {number}
 */
const POINTER_SIZE = 10;
function highlightVertex(quadRoot) {
    const mP = getVirtualMouseCoordinates();
    const nodes = quadRoot.getNodesInRange({x: mP.x - 0.5 * POINTER_SIZE,
            y: mP.y + 0.5 * POINTER_SIZE},
        {x: mP.x + 0.5 * POINTER_SIZE,
            y: mP.y - 0.5 * POINTER_SIZE});

    push();
    fill(255, 0.5);
    rectMode(RADIUS);
    //rect(mP.x, -mP.y, POINTER_SIZE); //TODO debug, remove
    pop();

    if (nodes.length === 0) {
        highlightedVertex = null;
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
        highlightedVertex = null;
        return;
    }

    if (highlightedVertex == null) {
        Utils.randomEdges(h);
    }

    return h;
}

function getVirtualMouseCoordinates() {
    // noinspection JSUnresolvedVariable
    return camera.screen2virtual({x: mouseX, y: mouseY});
}