const Debug = {
    timingEvents: {},
    lastTime: 0,

    drawCrosshairs: function (p) {
        p.push();
        strokeWeight(3);
        p.stroke("white");
        line(0, 10, 0, -10);
        line(-10, 0, 10, 0);
        p.pop();
    },

    printMouseCoordinates: function (p, camera) {
        let mP = MouseEvents.getVirtualMouseCoordinates(p, camera);
        p.push();
        p.translate(0, 0);
        p.scale(1);
        p.fill("white");
        p.noStroke();
        p.text(mP.x, 10, 25);
        p.text(mP.y, 10, 50);
        p.pop();
    },

    drawScreenCrosshairs: function (p) {
        p.push();
        strokeWeight(1);
        p.stroke("aqua");
        line(p.width / 2, 0, p.width / 2, p.height);
        line(0, p.height / 2, p.width, p.height / 2);
        p.pop();
    },

    printFPS: function (p) {
        p.push();
        let fps = p.frameRate(p);
        p.fill(255);
        p.stroke(0);
        p.text("FPS: " + fps.toFixed(2), 10, p.height - 10);
        p.pop();
    },

    debugCamera: function (p, camera) {
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

    debugHovered: function (p, hoveredArtist) {
        p.push();
        p.translate(0, 0);
        p.scale(1);
        p.fill("white");
        p.noStroke();
        let name = (hoveredArtist !== null) ? hoveredArtist.name : "None";
        p.text("Hovered Artist: " + name, 10, 175);
        p.pop();
    },

    canvasSize: function (p) {
        p.push();
        p.translate(0, 0);
        p.scale(1);
        p.fill("white");
        p.noStroke();
        p.text("Canvas Width: " + p.width, 10, 200);
        p.text("Canvas Height: " + p.height, 10, 225);
        p.pop();
    },

    loadingStats: function (p, unloadedQuads, loadingQuads, unprocessedResponses) {
        p.push();
        p.fill("white");
        p.noStroke();
        p.text("Unloaded Quads " + unloadedQuads.size, 10, 250);
        p.text("Loading Quads " + loadingQuads.size, 10, 275);
        p.text("Unprocessed Requests " + unprocessedResponses.length, 10, 300);
        p.pop();
    },

    averageTimingEvents: {},
    timingGraph: function (p) {
        p.push();
        p.rectMode(p.CORNER);
        p.fill('white');
        p.noStroke();
        let total = 0;

        for (const timingName of Object.keys(this.timingEvents)) {
            total += this.timingEvents[timingName];
        }

        let currentHeight = p.height - 40
        for (const timingName of Object.keys(this.timingEvents)) {
            const percentage = this.timingEvents[timingName] / total;

            if (this.averageTimingEvents[timingName]) {
                this.averageTimingEvents[timingName] = (percentage + 9 * this.averageTimingEvents[timingName]) / 10;
            } else {
                this.averageTimingEvents[timingName] = percentage;
            }

            p.rect(10, currentHeight, this.averageTimingEvents[timingName] * 50, 10);
            p.text(timingName + " - " + this.timingEvents[timingName].toFixed(2), 100, currentHeight + 8);
            currentHeight -= 20;
        }
        p.pop();
    },

    versionNumber: function(p) {
        p.push();
        p.fill("white");
        p.noStroke();
        p.textAlign(p.RIGHT);
        p.text(`Version ${VersionHelper.versionNumber}`, p.width - 10, p.height - 10);
        p.pop();
    },

    createTimingEvent: function(name) {
        this.timingEvents[name] = performance.now() - this.lastTime;
        this.lastTime = performance.now();
    },

    resetTiming: function() {
        this.lastTime = performance.now();
        for (const timingName of Object.keys(this.timingEvents)) {
            this.timingEvents[timingName] = 0;
        }
    },

    debugAll: function (p, camera, hoveredArtist, unloadedQuads, loadingQuads, unprocessedResponses) {
        p.push();
        camera.setView();
        //this.drawCrosshairs(p);
        p.pop();
        this.debugCamera(p, camera);
        //this.drawScreenCrosshairs(p);
        this.debugHovered(p, hoveredArtist);
        this.canvasSize(p);
        this.printFPS(p);
        this.printMouseCoordinates(p, camera);
        this.loadingStats(p, unloadedQuads, loadingQuads, unprocessedResponses);
        this.timingGraph(p)
        this.versionNumber(p);
    }
}