/**
 * Helper file to hold all global mouse events
 * to help separate from drawing.
 */

const DRIFT_THRESHOLD = 0.1;
const SCROLL_STEPS = 8;

const MouseEvents = {
    dragging: false,
    drag: {},
    start: {},
    drifting: false,
    driftVec: null,
    scrollDelta: 0,
    scrollStep: 0,
    zooming: false,
    zoomCoordinates: {},

    zoom: function () {
        if (this.zooming) {
            this.scrollStep++;
            camera.zoom += this.scrollDelta / SCROLL_STEPS;
            camera.zoom = min(camera.zoom, 8.5);
            camera.zoomCamera(this.zoomCoordinates);
            if (this.scrollStep === SCROLL_STEPS) {
                this.zooming = false;
                this.scrollStep = 0;
            }
        }
    },

    drift: function (camera) {
        if (this.drifting) {
            if (this.driftVec.mag() < DRIFT_THRESHOLD) {
                this.drifting = false;
                return;
            }
            this.driftVec.div(1.1);
            camera.x -= this.driftVec.x * (camera.width / width);
            camera.y += this.driftVec.y * (camera.height / height);
        }
    },

    getVirtualMouseCoordinates: function() {
        return camera.screen2virtual({x: mouseX, y: mouseY});
    }
}

// noinspection JSUnusedGlobalSymbols
function mouseWheel(e) {
    e.preventDefault();
    const isTouchPad = e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0

    if (isTouchPad) {
        if (e.ctrlKey) {
            MouseEvents.zooming = true;
            MouseEvents.scrollDelta = e.deltaY / 300;
            MouseEvents.scrollStep = 0;
            MouseEvents.zoomCoordinates = MouseEvents.getVirtualMouseCoordinates();
        } else {
            camera.x += e.deltaX;
            camera.y += e.deltaY;
        }
    } else {
        MouseEvents.zooming = true;
        MouseEvents.scrollStep = 0;
        MouseEvents.zoomCoordinates = MouseEvents.getVirtualMouseCoordinates();
        if (e.ctrlKey) {
            MouseEvents.scrollDelta = e.delta / 150;
        } else {
            MouseEvents.scrollDelta = e.delta / 300;
        }
    }
}



// noinspection JSUnusedGlobalSymbols
function mousePressed() {
    if (!SearchBox.hoverFlag && !Sidebar.hoverFlag) {
        MouseEvents.dragging = true;
        MouseEvents.drag = {x: mouseX, y: mouseY};
        MouseEvents.start = {x: mouseX, y: mouseY};
    }

    if (!SearchBox.hoverFlag) {
        SearchBox.deleteSuggestions();
        SearchBox.input.value = "";
    }
}

// noinspection JSUnusedGlobalSymbols
function mouseDragged() {
    if (MouseEvents.dragging) {
        const newDrag = MouseEvents.getVirtualMouseCoordinates();
        const oldDrag = camera.screen2virtual(MouseEvents.drag);
        camera.x += (oldDrag.x - newDrag.x);
        camera.y += (oldDrag.y - newDrag.y);
        MouseEvents.drag = {x: mouseX, y: mouseY};
    }
}

// noinspection JSUnusedGlobalSymbols
function mouseReleased() {
    if (MouseEvents.dragging) {
        const newDrag = MouseEvents.getVirtualMouseCoordinates();
        const oldDrag = camera.screen2virtual(MouseEvents.drag);
        camera.x += (oldDrag.x - newDrag.x);
        camera.y += (oldDrag.y - newDrag.y);

        if (dist(MouseEvents.start.x, MouseEvents.start.y, MouseEvents.drag.x, MouseEvents.drag.y) < 5) {
            if (hoveredArtist) {
                if (hoveredArtist !== clickedArtist) {
                    newEdges = true;
                    clickedArtist = hoveredArtist;
                    Sidebar.resetSidebar(false);
                }
                edgeDrawing = true;
            } else {
                edgeDrawing = false;
                clickedArtist = null;
                Sidebar.resetSidebar(true);
            }
        }

        MouseEvents.driftVec = createVector(winMouseX - pwinMouseX, winMouseY - pwinMouseY);
        MouseEvents.drifting = true;
        MouseEvents.dragging = false;
    }
}

