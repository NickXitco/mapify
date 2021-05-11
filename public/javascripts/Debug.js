const Debug = {
    timingEvents: {},
    lastTime: 0,
    defaultStyle: new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 12,
        fill:['#ffffff']
    }),

    textObjects: {},

    initDebug: function() {
        // TODO create all text objects
    },

    printMouseCoordinates: function (canvas, container, camera) {
        let mP = MouseEvents.getVirtualMouseCoordinates(canvas, camera);
        const mouse = new PIXI.Text(
            `Virtual Coordinates: (${mP.x.toFixed(1)}, ${mP.y.toFixed(1)})`,
            Debug.defaultStyle
        );
        mouse.x = 20;
        mouse.y = 275;
        container.addChild(mouse);
    },

    printFPS: function (canvas, container) {
        const fps = canvas.ticker.FPS;
        const fpsText = new PIXI.Text(`FPS: ${Math.round(fps)}`, Debug.defaultStyle);
        fpsText.x = 20;
        fpsText.y = canvas.renderer.height - 70;
        container.addChild(fpsText);
    },

    debugCamera: function (container, camera) {
        const center = new PIXI.Text(`Camera Center: (${camera.x.toFixed(2)}, ${camera.y.toFixed(2)})`, Debug.defaultStyle);
        const width = new PIXI.Text(`Camera Width: ${camera.width.toFixed(2)}`, Debug.defaultStyle);
        const height = new PIXI.Text(`Camera Height: ${camera.height.toFixed(2)}`, Debug.defaultStyle);
        const zoom = new PIXI.Text(`Camera Zoom: ${camera.zoom.toFixed(2)}`, Debug.defaultStyle);
        const zoomFactor = new PIXI.Text(`Camera Zoom Factor: ${camera.getZoomFactor().x.toFixed(2)}`, Debug.defaultStyle);
        center.x = 20;
        width.x = 20;
        height.x = 20;
        zoom.x = 20;
        zoomFactor.x = 20;

        center.y = 75;
        width.y = 100;
        height.y = 125;
        zoom.y = 150;
        zoomFactor.y = 175;

        container.addChild(center);
        container.addChild(width);
        container.addChild(height);
        container.addChild(zoom);
        container.addChild(zoomFactor);
    },

    debugHovered: function (container, hoveredArtist) {
        let name = (hoveredArtist !== null) ? hoveredArtist.name : "None";
        const a = new PIXI.Text(`Hovered Artist:${name}`, Debug.defaultStyle);
        a.x = 20;
        a.y = 200;
        container.addChild(a);
    },

    canvasSize: function (canvas, container) {
        const width = new PIXI.Text(`Canvas Width: ${canvas.renderer.width}`, Debug.defaultStyle);
        const height = new PIXI.Text(`Canvas Height: ${canvas.renderer.height}`, Debug.defaultStyle);
        width.x = 20;
        width.y = 225;
        height.x = 20;
        height.y = 250;
        container.addChild(width);
        container.addChild(height);
    },

    loadingStats: function (container, unloadedQuads, loadingQuads, unprocessedResponses, loadedNodes) {
        const unloaded = new PIXI.Text(`Unloaded Quads: ${unloadedQuads.size}`, Debug.defaultStyle);
        const loading = new PIXI.Text(`Loading Quads: ${loadingQuads.size}`, Debug.defaultStyle);
        const unprocessed = new PIXI.Text(`Unprocessed Responses: ${unprocessedResponses.length}`, Debug.defaultStyle);
        const loaded = new PIXI.Text(`Loaded Nodes: ${loadedNodes}`, Debug.defaultStyle);

        unloaded.x = 20;
        loading.x = 20;
        unprocessed.x = 20;
        loaded.x = 20;

        unloaded.y = 325;
        loading.y = 350;
        unprocessed.y = 375;
        loaded.y = 400;

        container.addChild(unloaded);
        container.addChild(loading);
        container.addChild(unprocessed);
        container.addChild(loaded);
    },

    latLongStats: function (canvas, container, camera) {
        let mP = MouseEvents.getVirtualMouseCoordinates(canvas, camera);
        const latLong = Utils.gnomicProjection(mP.x, mP.y, 0, -0.5 * Math.PI, PLANE_RADIUS);

        const mouse = new PIXI.Text(
            `Projected Lat/Long: (${latLong.longitude.toFixed(2)}, ${latLong.latitude.toFixed(2)})`,
            Debug.defaultStyle
        );

        mouse.x = 20;
        mouse.y = 300;
        container.addChild(mouse);
    },

    averageTimingEvents: {},
    timingGraph: function (canvas, container) {
        let total = 0;

        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);

        for (const timingName of Object.keys(this.timingEvents)) {
            total += this.timingEvents[timingName];
        }

        let currentHeight = canvas.renderer.height - 90;
        for (const timingName of Object.keys(this.timingEvents)) {
            const percentage = this.timingEvents[timingName] / total;

            if (this.averageTimingEvents[timingName]) {
                this.averageTimingEvents[timingName] = (percentage + 9 * this.averageTimingEvents[timingName]) / 10;
            } else {
                this.averageTimingEvents[timingName] = percentage;
            }

            graphics.drawRect(20, currentHeight, this.averageTimingEvents[timingName] * 50, 10);
            const label = new PIXI.Text(
                timingName + " - " + this.timingEvents[timingName].toFixed(2),
                Debug.defaultStyle
            );
            label.x = 100;
            label.y = currentHeight - 2;

            container.addChild(label);

            currentHeight -= 20;
        }

        container.addChild(graphics);
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

    containerStats: function(debug, quad, node, edge) {
        const debugLength = new PIXI.Text(`Debug Container: ${debug.children.length}`, Debug.defaultStyle);
        const quadLength = new PIXI.Text(`Quad Container: ${quad.children.length}`, Debug.defaultStyle);
        const nodeLength = new PIXI.Text(`Node Container: ${node.children.length}`, Debug.defaultStyle);
        const edgeLength = new PIXI.Text(`Edge Container: ${edge.children.length}`, Debug.defaultStyle);

        debugLength.x = 20;
        quadLength.x = 20;
        nodeLength.x = 20;
        edgeLength.x = 20;

        debugLength.y = 425;
        quadLength.y = 450;
        nodeLength.y = 475;
        edgeLength.y = 500;

        debug.addChild(debugLength);
        debug.addChild(quadLength);
        debug.addChild(nodeLength);
        debug.addChild(edgeLength);
    },

    debugAll: function (
        debugContainer, canvas, camera, hoveredArtist, unloadedQuads,
        loadingQuads, unprocessedResponses, numNodes,

        quadContainer, nodeContainer, edgeContainer
    ) {
        debugContainer.removeChildren(); //TODO this is technically inefficient (I think?)
        this.debugCamera(debugContainer, camera);
        this.debugHovered(debugContainer, hoveredArtist);
        this.canvasSize(canvas, debugContainer);
        this.printFPS(canvas, debugContainer);
        this.printMouseCoordinates(canvas, debugContainer, camera);
        this.latLongStats(canvas, debugContainer, camera);
        this.loadingStats(debugContainer, unloadedQuads, loadingQuads, unprocessedResponses, numNodes);
        this.timingGraph(canvas, debugContainer);
        this.containerStats(debugContainer, quadContainer, nodeContainer, edgeContainer);
    }
}

Debug.initDebug()