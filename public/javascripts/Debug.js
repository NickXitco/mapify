const Debug = {
    drawCrosshairs: function () {
        p.push();
        strokeWeight(3);
        p.stroke("white");
        line(0, 10, 0, -10);
        line(-10, 0, 10, 0);
        p.pop();
    },

    printMouseCoordinates: function () {
        let mP = MouseEvents.getVirtualMouseCoordinates();
        p.push();
        p.translate(0, 0);
        p.scale(1);
        p.fill("white");
        p.noStroke();
        p.text(mP.x, 10, 25);
        p.text(mP.y, 10, 50);
        p.pop();
    },

    drawScreenCrosshairs: function () {
        p.push();
        strokeWeight(1);
        p.stroke("aqua");
        line(p.width / 2, 0, p.width / 2, p.height);
        line(0, p.height / 2, p.width, p.height / 2);
        p.pop();
    },

    printFPS: function () {
        p.push();
        let fps = p.frameRate();
        p.fill(255);
        p.stroke(0);
        p.text("FPS: " + fps.toFixed(2), 10, p.height - 10);
        p.pop();
    },

    debugCamera: function () {
        p.push();
        p.translate(0, 0);
        p.scale(1);
        p.fill("white");
        p.noStroke();
        p.text("Camera Center: (" + camera.x + ", " + camera.y + ")", 10, 75);
        p.text("Camera Width: " + camera.width, 10, 100);
        p.text("Camera Height: " + camera.height, 10, 125);
        p.text("Camera Zoom: " + camera.zoom, 10, 150);
        p.pop();
    },

    debugHovered: function () {
        p.push();
        p.translate(0, 0);
        p.scale(1);
        p.fill("white");
        p.noStroke();
        let name = (hoveredArtist !== null) ? hoveredArtist.name : "None";
        p.text("Hovered Artist: " + name, 10, 175);
        p.pop();
    },

    canvasSize: function () {
        p.push();
        p.translate(0, 0);
        p.scale(1);
        p.fill("white");
        p.noStroke();
        p.text("Canvas Width: " + p.width, 10, 200);
        p.text("Canvas Height: " + p.height, 10, 225);
        p.pop();
    },

    loadingStats: function () {
        p.push();
        p.fill("white");
        p.noStroke();
        p.text("Unloaded Quads " + unloadedQuads.size, 10, 250);
        p.text("Loading Quads " + loadingQuads.size, 10, 275);
        p.text("Unprocessed Requests " + unprocessedResponses.length, 10, 300);
        p.pop();
    },

    averageTimingEvents: {},
    timingGraph: function (timingEvents) {
        p.push();
        p.rectMode(p.CORNER);
        p.fill('white');
        p.noStroke();
        let total = 0;

        for (const timingName of Object.keys(timingEvents)) {
            total += timingEvents[timingName];
        }

        let currentHeight = p.height - 40
        for (const timingName of Object.keys(timingEvents)) {
            const percentage = timingEvents[timingName] / total;

            if (this.averageTimingEvents[timingName]) {
                this.averageTimingEvents[timingName] = (percentage + 9 * this.averageTimingEvents[timingName]) / 10;
            } else {
                this.averageTimingEvents[timingName] = percentage;
            }

            p.rect(10, currentHeight, this.averageTimingEvents[timingName] * 50, 10);
            p.text(timingName + " - " + timingEvents[timingName].toFixed(2), 100, currentHeight + 8);
            currentHeight -= 20;
        }
        p.pop();
    },

    versionNumber: function() {
        p.push();
        p.fill("white");
        p.noStroke();
        p.textAlign(p.RIGHT);
        p.text(`Version ${VersionHelper.versionNumber}`, p.width - 10, p.height - 10);
        p.pop();
    },

    debugAll: function (camera, timingEvents) {
        p.push();
        camera.setView();
        //Debug.drawCrosshairs();
        p.pop();
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