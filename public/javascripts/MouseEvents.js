/**
 * Helper file to hold all global mouse events
 * to help separate from drawing.
 */
let dragging = false;
let drag; //stored as screen coordinates
let start;

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
    if (!searchHover && !sidebarHover) {
        dragging = true;
        drag = {x: mouseX, y: mouseY};
        start = {x: mouseX, y: mouseY};
    }
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
    if (dragging) {
        const newDrag = getVirtualMouseCoordinates();
        const oldDrag = camera.screen2virtual(drag);
        camera.x += (oldDrag.x - newDrag.x);
        camera.y += (oldDrag.y - newDrag.y);

        if (dist(start.x, start.y, drag.x, drag.y) < 5) {
            if (hoveredArtist) {
                if (hoveredArtist !== clickedArtist) {
                    newEdges = true;
                    clickedArtist = hoveredArtist;
                    resetSidebar(false);
                }
                edgeDrawing = true;
            } else {
                edgeDrawing = false;
                clickedArtist = null;
                resetSidebar(true);
            }
        }

        driftVec = createVector(winMouseX - pwinMouseX, winMouseY - pwinMouseY);
        drifting = true;
        dragging = false;
    }
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

function getVirtualMouseCoordinates() {
    // noinspection JSUnresolvedVariable
    return camera.screen2virtual({x: mouseX, y: mouseY});
}