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
            camera.zoom = Math.min(camera.zoom, 8.5);
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
            camera.x -= this.driftVec.x * (camera.width / p.width);
            camera.y += this.driftVec.y * (camera.height / p.height);
        }
    },

    getVirtualMouseCoordinates: function() {
        return camera.screen2virtual({x: p.mouseX, y: p.mouseY});
    }
}

function handlePointClick() {
    if (VersionHelper.showingChangelog) {
        VersionHelper.removeChangelog();
    } else if (Utils.dist(p.width - 10, p.height - 10, p.mouseX, p.mouseY) < 75) {
        VersionHelper.drawChangelog();
    }

    if (hoveredArtist) {
        if (hoveredArtist !== clickedArtist) {
            newEdges = true;
            clickedArtist = hoveredArtist;
            Sidebar.resetSidebar(false);
        }
        edgeDrawing = true;
        return;
    }

    if (edgeDrawing && GenreHelpers.genreNodes.size > 0) {
        edgeDrawing = false;
        clickedArtist = null;
        Sidebar.resetSidebar(false);
        Sidebar.setGenreSidebar();
    } else if (edgeDrawing) {
        edgeDrawing = false;
        clickedArtist = null;
        Sidebar.resetSidebar(true);
    } else if (GenreHelpers.genreNodes.size > 0) {
        GenreHelpers.resetGenreView();
        Sidebar.resetSidebar(true);
    }
}