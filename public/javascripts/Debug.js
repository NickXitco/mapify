const Debug = {
    drawCrosshairs: function () {
        push();
        strokeWeight(3);
        stroke("white");
        line(0, 10, 0, -10);
        line(-10, 0, 10, 0);
        pop();
    },

    printMouseCoordinates: function () {
        let mP = MouseEvents.getVirtualMouseCoordinates();
        push();
        translate(0, 0);
        scale(1);
        fill("white");
        noStroke();
        text(mP.x, 10, 25);
        text(mP.y, 10, 50);
        pop();
    },

    drawScreenCrosshairs: function () {
        push();
        strokeWeight(1);
        stroke("aqua");
        line(width / 2, 0, width / 2, height);
        line(0, height / 2, width, height / 2);
        pop();
    },

    printFPS: function () {
        push();
        let fps = frameRate();
        fill(255);
        stroke(0);
        text("FPS: " + fps.toFixed(2), 10, height - 10);
        pop();
    },

    debugCamera: function () {
        push();
        translate(0, 0);
        scale(1);
        fill("white");
        noStroke();
        text("Camera Center: (" + camera.x + ", " + camera.y + ")", 10, 75);
        text("Camera Width: " + camera.width, 10, 100);
        text("Camera Height: " + camera.height, 10, 125);
        text("Camera Zoom: " + camera.zoom, 10, 150);
        pop();
    },

    debugHovered: function () {
        push();
        translate(0, 0);
        scale(1);
        fill("white");
        noStroke();
        let name = (hoveredArtist !== null) ? hoveredArtist.name : "None";
        text("Hovered Artist: " + name, 10, 175);
        pop();
    },

    canvasSize: function () {
        push();
        translate(0, 0);
        scale(1);
        fill("white");
        noStroke();
        text("Canvas Width: " + width, 10, 200);
        text("Canvas Height: " + height, 10, 225);
        pop();
    },

    loadingStats: function () {
        push();
        fill("white");
        noStroke();
        text("Unloaded Quads " + unloadedQuads.size, 10, 250);
        text("Loading Quads " + loadingQuads.size, 10, 275);
        text("Unprocessed Requests " + unprocessedResponses.length, 10, 300);
        pop();
    },

    averageTimingEvents: {},
    timingGraph: function (timingEvents) {
        push();
        rectMode(CORNER);
        fill('white');
        noStroke();
        let total = 0;

        for (const timingName of Object.keys(timingEvents)) {
            total += timingEvents[timingName];
        }

        let currentHeight = height - 40
        for (const timingName of Object.keys(timingEvents)) {
            const percentage = timingEvents[timingName] / total;

            if (this.averageTimingEvents[timingName]) {
                this.averageTimingEvents[timingName] = (percentage + 9 * this.averageTimingEvents[timingName]) / 10;
            } else {
                this.averageTimingEvents[timingName] = percentage;
            }

            rect(10, currentHeight, this.averageTimingEvents[timingName] * 50, 10);
            text(timingName + " - " + timingEvents[timingName].toFixed(2), 100, currentHeight + 8);
            currentHeight -= 20;
        }
        pop();
    },

    versionNumber: function() {
        push();
        fill("white");
        noStroke();
        textAlign(RIGHT);
        text(`Version ${VersionHelper.versionNumber}`, width - 10, height - 10);
        pop();
    },

    debugAll: function (camera, timingEvents) {
        push();
        camera.setView();
        //Debug.drawCrosshairs();
        pop();
        this.debugCamera();
        //Debug.drawScreenCrosshairs();
        this.debugHovered();
        this.canvasSize();
        this.printFPS();
        this.printMouseCoordinates();
        this.loadingStats();
        this.timingGraph(timingEvents)
        this.versionNumber();
    }
}