class Debug {

    static drawCrosshairs() {
        push();
        strokeWeight(3);
        stroke("white");
        line(0, 10, 0, -10);
        line(-10, 0, 10, 0);
        pop();
    }

    static printMouseCoordinates() {
        let mP = MouseEvents.getVirtualMouseCoordinates();
        push();
        translate(0, 0);
        scale(1);
        fill("white");
        noStroke();
        text(mP.x, 10, 25);
        text(mP.y, 10, 50);
        pop();
    }

    static drawScreenCrosshairs() {
        push();
        strokeWeight(1);
        stroke("aqua");
        line(width / 2, 0, width / 2, height);
        line(0, height / 2, width, height / 2);
        pop();
    }

    static printFPS() {
        push();
        let fps = frameRate();
        fill(255);
        stroke(0);
        text("FPS: " + fps.toFixed(2), 10, height - 10);
        pop();
    }

    static debugCamera() {
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
    }

    static debugHovered() {
        push();
        translate(0, 0);
        scale(1);
        fill("white");
        noStroke();
        let name = (hoveredArtist !== null) ? hoveredArtist.name : "None";
        text("Hovered Artist: " + name, 10, 175);
        pop();
    }

    static canvasSize() {
        push();
        translate(0, 0);
        scale(1);
        fill("white");
        noStroke();
        text("Canvas Width: " + width, 10, 200);
        text("Canvas Height: " + height, 10, 225);
        pop();
    }

    static loadingStats() {
        push();
        fill("white");
        noStroke();
        text("Unloaded Quads " + unloadedQuads.size, 10, 250);
        text("Loading Quads " + loadingQuads.size, 10, 275);
        text("Unprocessed Requests " + unprocessedResponses.length, 10, 300);
        pop();
    }

    static averageTimingEvents = {};
    static timingGraph(timingEvents) {
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
    }

    static debugAll(camera, timingEvents) {
        push();
        camera.setView();
        //Debug.drawCrosshairs();
        pop();
        Debug.debugCamera();
        //Debug.drawScreenCrosshairs();
        Debug.debugHovered();
        Debug.canvasSize();
        Debug.printFPS();
        Debug.printMouseCoordinates();
        Debug.loadingStats();
        Debug.timingGraph(timingEvents)
    }
}