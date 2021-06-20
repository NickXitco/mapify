/**
 * Helper file to hold all global mouse events
 * to help separate from drawing.
 */

const DRIFT_THRESHOLD = 0.1;
const SCROLL_STEPS = 10;
const DELTA_MULTIPLIER = 3;
const NUM_AVG_STEPS = 4;

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
    lastClickTime: 0,
    speed: {},

    updateSpeed: function (newSpeed) {
        this.speed = {
            x: (newSpeed.x * (NUM_AVG_STEPS / 2) + (NUM_AVG_STEPS / 2) * this.speed.x) / NUM_AVG_STEPS,
            y: (newSpeed.y * (NUM_AVG_STEPS / 2) + (NUM_AVG_STEPS / 2) * this.speed.y) / NUM_AVG_STEPS
        }
    },

    zoom: function (camera) {
        if (this.zooming) {
            this.scrollStep++;
            camera.zoom += (this.scrollDelta * DELTA_MULTIPLIER) / SCROLL_STEPS;
            camera.zoom = Math.min(camera.zoom, 2.5);
            camera.zoomCamera(this.zoomCoordinates);
            if (this.scrollStep === SCROLL_STEPS) {
                this.zooming = false;
                this.scrollStep = 0;
            }
        }
    },

    drift: function (camera, canvas) {
        if (this.drifting) {
            const mag = Utils.dist(0, 0, this.driftVec.x, this.driftVec.y);
            if (mag < DRIFT_THRESHOLD) {
                this.drifting = false;
                return;
            }

            this.driftVec.x /= 1.1;
            this.driftVec.y /= 1.1;
            camera.x -= this.driftVec.x * (camera.width / canvas.screen.width);
            camera.y += this.driftVec.y * (camera.height / canvas.screen.height);
        }
    },

    getVirtualMouseCoordinates: function(canvas, camera) {
        const point = canvas.renderer.plugins.interaction.mouse.global;
        return camera.screen2virtual({x: point.x, y: point.y});
    },

    isDoubleClick: function(clickTime) {
        const THRESHOLD = 300;
        return Math.abs(clickTime - this.lastClickTime) < THRESHOLD;
    }
}

function handlePointClick(quadHead, hoveredArtist) {
    if (hoveredArtist) {
        return hoveredArtist;
    }

    return null;
}