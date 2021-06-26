const Debug = {
    timingEvents: {},
    lastTime: 0,
    defaultStyle: new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 12,
        fill:['#ffffff']
    }),

    textObjects: {},
    isInitialized: false,
    graphicsObject: null,

    initDebug: function(container) {
        let y = 75;
        const x = 20;
        this.textObjects.cameraCenter = Debug.createText(x, y, container); y += 25;
        this.textObjects.cameraDimensions = Debug.createText(x, y, container); y += 25;
        this.textObjects.cameraZoom = Debug.createText(x, y, container); y += 25;
        this.textObjects.hoveredArtist = Debug.createText(x, y, container); y += 25;
        this.textObjects.canvasDimensions = Debug.createText(x, y, container); y += 25;
        this.textObjects.virtualCoords = Debug.createText(x, y, container); y += 25;
        this.textObjects.latLong = Debug.createText(x, y, container); y += 25;
        this.textObjects.unloaded = Debug.createText(x, y, container); y += 25;
        this.textObjects.loading = Debug.createText(x, y, container); y += 25;
        this.textObjects.unprocessed = Debug.createText(x, y, container); y += 25;
        this.textObjects.loaded = Debug.createText(x, y, container); y += 25;
        this.textObjects.fps = Debug.createText(x, y, container);

        this.textObjects.labels = [];
        for (const timingName of Object.keys(this.timingEvents)) {
            this.textObjects.labels.push(Debug.createText(100, y, container));
        }

        this.isInitialized = true;
    },

    createText: function(x, y, container) {
        const text = new PIXI.Text(`_`, Debug.defaultStyle);
        text.x = x;
        text.y = y;
        container.addChild(text);
        return text;
    },

    printMouseCoordinates: function (canvas, camera) {
        let mP = MouseEvents.getVirtualMouseCoordinates(canvas, camera);
        this.textObjects.virtualCoords.text = `Virtual Coordinates: (${mP.x.toFixed(1)}, ${mP.y.toFixed(1)})`;
    },

    printFPS: function (canvas, container) {
        const fps = canvas.ticker.FPS;
        this.textObjects.fps.text = `FPS: ${Math.round(fps)}`;
        this.textObjects.fps.y = canvas.renderer.height - 170;
    },

    debugCamera: function (camera) {
        this.textObjects.cameraCenter.text = `Camera Center: (${camera.x.toFixed(2)}, ${camera.y.toFixed(2)})`;
        this.textObjects.cameraDimensions.text = `Camera Dimensions (w,h): (${camera.width.toFixed(2)}, ${camera.height.toFixed(2)})`;
        this.textObjects.cameraZoom.text = `Camera Zoom: ${camera.zoom.toFixed(2)} @${camera.getZoomFactor().x.toFixed(2)}`;
    },

    debugHovered: function (hoveredArtist) {
        let name = (hoveredArtist !== null) ? hoveredArtist.name : "None";
        this.textObjects.hoveredArtist.text = `Hovered Artist: ${name}`;
    },

    canvasSize: function (canvas) {
        this.textObjects.canvasDimensions.text = `Canvas Dimensions (w,h): (${canvas.renderer.width}, ${canvas.renderer.height})`;
    },

    loadingStats: function (unloadedQuads, loadingQuads, unprocessedResponses, loadedNodes) {
        this.textObjects.unloaded.text = `Unloaded Quads: ${unloadedQuads.size}`;
        this.textObjects.loading.text = `Loading Quads: ${loadingQuads.size}`;
        this.textObjects.unprocessed.text = `Unprocessed Responses: ${unprocessedResponses.length}`;
        this.textObjects.loaded.text = `Loaded Nodes: ${loadedNodes}`;
    },

    latLongStats: function (canvas, camera) {
        let mP = MouseEvents.getVirtualMouseCoordinates(canvas, camera);
        const latLong = Utils.gnomicProjection(mP.x, mP.y, 0, -0.5 * Math.PI, PLANE_RADIUS);
        this.textObjects.latLong.text = (
            `Projected Lat/Long: (${latLong.longitude.toFixed(2)}, ${latLong.latitude.toFixed(2)})`
        );
    },

    averageTimingEvents: {},
    timingGraph: function (canvas, container) {
        let total = 0;

        if (!this.graphicsObject) {
            this.graphicsObject = new PIXI.Graphics();
            container.addChild(this.graphicsObject);
        }

        this.graphicsObject.clear();
        this.graphicsObject.beginFill(0xFFFFFF);

        for (const timingName of Object.keys(this.timingEvents)) {
            total += this.timingEvents[timingName];
        }

        let currentHeight = canvas.renderer.height / resolution - 190;
        let i = 0;
        for (const timingName of Object.keys(this.timingEvents)) {
            const percentage = this.timingEvents[timingName] / total;

            if (this.averageTimingEvents[timingName]) {
                this.averageTimingEvents[timingName] = (percentage + 9 * this.averageTimingEvents[timingName]) / 10;
            } else {
                this.averageTimingEvents[timingName] = percentage;
            }

            this.graphicsObject.drawRect(20, currentHeight, this.averageTimingEvents[timingName] * 50, 10);
            this.textObjects.labels[i].text = timingName + " - " + this.timingEvents[timingName].toFixed(2);
            this.textObjects.labels[i].y = currentHeight - 2;

            currentHeight -= 20;
            i++;
        }
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

    debugAll: function (
        debugContainer, canvas, camera, hoveredArtist, unloadedQuads,
        loadingQuads, unprocessedResponses, numNodes,
    ) {
        if (!this.isInitialized) {
            this.initDebug(debugContainer);
        }

        this.debugCamera(camera);
        this.debugHovered(hoveredArtist);
        this.canvasSize(canvas);
        this.printFPS(canvas, debugContainer);
        this.printMouseCoordinates(canvas, camera);
        this.latLongStats(canvas, camera);
        this.loadingStats(unloadedQuads, loadingQuads, unprocessedResponses, numNodes);
        this.timingGraph(canvas, debugContainer);
    }
}