/**
 * Helper file to hold all global mouse events
 * to help separate from drawing.
 */

const DRIFT_THRESHOLD = 0.1;
const SCROLL_STEPS = 10;
const DELTA_MULTIPLIER = 3;

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

    zoom: function (camera) {
        if (this.zooming) {
            this.scrollStep++;
            camera.zoom += (this.scrollDelta * DELTA_MULTIPLIER) / SCROLL_STEPS;
            camera.zoom = Math.min(camera.zoom, 8.5);
            camera.zoomCamera(this.zoomCoordinates);
            if (this.scrollStep === SCROLL_STEPS) {
                this.zooming = false;
                this.scrollStep = 0;
            }
        }
    },

    drift: function (camera, p) {
        if (this.drifting) {
            if (this.driftVec.mag() < DRIFT_THRESHOLD) {
                this.drifting = false;
                return;
            }
            this.driftVec.div(1.1);
            camera.x -= this.driftVec.x * (camera.width / p.width);
            camera.y += this.driftVec.y * (camera.height / p.height);
        }
    },

    getVirtualMouseCoordinates: function(p, camera) {
        return camera.screen2virtual({x: p.mouseX, y: p.mouseY});
    }
}

function handlePointClick(quadHead, hoveredArtist) {
    if (hoveredArtist) {
        return hoveredArtist;
    }

    return null;
}