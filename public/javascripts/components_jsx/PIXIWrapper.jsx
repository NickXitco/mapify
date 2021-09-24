let resolution = 1;
let canvasFPS = 60;
class PIXIWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef()
        this.loading = true;
        this.dragDrawing = false;
        this.frameCount = 0;

        this.activeArtist = null;
        this.activeGenre = null;
        this.activePath = null;
        this.activeRegion = null;
        this.activeHover = null;

        this.setup = this.setup.bind(this);
        this.draw = this.draw.bind(this);

        this.captureWheel = this.captureWheel.bind(this);
        this.mousePressed = this.mousePressed.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseReleased = this.mouseReleased.bind(this);
        this.keyReleaseHandler = this.keyReleaseHandler.bind(this);
    }

    draw() {
        this.frameCount++;
        //Dampen FPS calculation
        canvasFPS = (this.app.ticker.FPS + 19 * canvasFPS) / 20;
        Debug.fps = canvasFPS;
        if (this.loading) {
            drawLoading();
            return;
        }

        Debug.resetTiming();

        const redrawEdges = MouseEvents.zooming || this.props.camera.moving;

        this.cameraMoves();
        Debug.createTimingEvent("Camera Moves");

        this.quadProcessing();
        Debug.createTimingEvent("Quad Processing");

        // DustBunny.drawBunnies(this.dustBunnies, p, this.props.camera);
        // Debug.createTimingEvent("Dust Bunnies");

        this.hoveredArtist();
        Debug.createTimingEvent("Get Hovered Artist");

        //Is there a clicked artist but it's not loaded yet?
        const shouldLoadArtist = this.props.clickedArtist && !this.props.clickedArtist.loaded && !this.clickedLoading;
        if (shouldLoadArtist) {
            this.clickedLoading = true;
            loadArtist(
                this.props.clickedArtist, this.props.quadHead, this.props.nodeLookup
            ).then(() => {this.clickedLoading = false});
        }

        this.fenceRunner();

        this.darken.runDarkening(this.props.path, 'sp');

        const newActivePath = this.activePath !== this.props.path;
        this.cleanPath(newActivePath);
        this.pathEdgeRunner(redrawEdges);
        Debug.createTimingEvent("Draw SP Edges");

        this.pathNodeRunner();
        Debug.createTimingEvent("Draw SP Nodes");

        this.darken.runDarkening(this.props.genre, 'genre');

        const newActiveGenre = this.activeGenre !== this.props.genre;
        this.cleanGenre(newActiveGenre);
        this.genreRunner();
        Debug.createTimingEvent("Draw Genre");

        this.darken.runDarkening(this.props.clickedArtist, 'related');

        const newActiveArtist = this.activeArtist !== this.props.clickedArtist;
        this.cleanArtists(newActiveArtist);

        const drawArtist = this.props.clickedArtist && this.props.clickedArtist.loaded;
        this.artistEdgeRunner(drawArtist, redrawEdges);
        Debug.createTimingEvent("Draw Related Edges");

        let i = this.relatedNodeRunner(drawArtist);
        undraw(this.highlightNodes, i);
        Debug.createTimingEvent("Draw Related Nodes");

        this.runDebug();
    }

    fenceRunner() {
        this.regionFence.clear();
        if (this.props.fence.length > 0) {
            let postPoint = MouseEvents.getVirtualMouseCoordinates(this.app, this.props.camera);
            let firstPoint = {x: Infinity, y: Infinity}

            if (this.props.fence.length > 0) {
                firstPoint = this.props.fence[0];
            }

            const postFirstDist = Utils.dist(postPoint.x, postPoint.y, firstPoint.x, firstPoint.y);
            const validDist = Math.max(
                FENCE_CLICK_MIN_VIRTUAL_RADIUS * 2,
                (FENCE_CLICK_RADIUS * 2) / this.props.camera.getZoomFactor().x
            );

            if (this.props.fencing) {
                if (postFirstDist < validDist / 2 && this.props.fence.length > 2 && !this.dragDrawing) {
                    this.props.setCursor('pointer');
                } else {
                    this.props.setCursor('auto');
                }
            }

            this.regionFence.lineStyle(
                Math.max(0.5, 1 / this.props.camera.getZoomFactor().x),
                0xFFFFFF
            )

            this.regionFence.moveTo(this.props.fence[0].x, -this.props.fence[0].y);
            for (const point of this.props.fence) {
                //p.circle(point.x, -point.y, Math.max(FENCE_CLICK_MIN_VIRTUAL_RADIUS * 2, (FENCE_CLICK_RADIUS * 2) / this.props.camera.getZoomFactor().x));
                this.regionFence.lineTo(point.x, -point.y);
                //p.fill('white');

                if (this.props.fencing && !this.dragDrawing) {
                    this.regionFence.drawCircle(
                        point.x, -point.y,
                        Math.max(
                            FENCE_CLICK_MIN_VIRTUAL_RADIUS * 2,
                            (FENCE_CLICK_RADIUS * 2) / this.props.camera.getZoomFactor().x
                        ) / 2
                    );
                }
            }

            if (!this.props.fencing && this.props.fence.length > 2) {
                this.regionFence.closePath();
            }

            //TODO consider moving this to a darken Shade like the others
            this.regionFence.lineStyle(0, 0);
            if (!this.props.fencing && this.props.fence.length > 2) {
                this.regionFence.beginFill(0x030303, 200 / 255);
                this.regionFence.drawRect(-5000, -5000, 10000, 10000);
                this.regionFence.beginHole();
                this.regionFence.moveTo(this.props.fence[0].x, this.props.fence[0].y);
                for (let i = 0; i < this.props.fence.length; i++) {
                    const point = this.props.fence[i];
                    this.regionFence.lineTo(point.x, -point.y);
                }
                this.regionFence.closePath();
                this.regionFence.endHole();
                this.regionFence.endFill();
            }
        }
    }

    pathEdgeRunner(redrawEdges) {
        if (this.activePath) {
            //add edges to scene
            for (const e of this.props.path.edges) {
                if (!e.graphicsHead.parent) {
                    this.pathEdges.addChild(e.graphicsHead);
                    this.pathEdges.addChild(e.graphicsTail);
                }

                const THRESHOLD = 0.5;
                const uStrokeWeight = e.u.size / STROKE_DIVIDER;
                const vStrokeWeight = e.v.size / STROKE_DIVIDER;
                const uAdjustedWeight = Math.max(uStrokeWeight, THRESHOLD / this.props.camera.getZoomFactor().x);
                const vAdjustedWeight = Math.max(vStrokeWeight, THRESHOLD / this.props.camera.getZoomFactor().x);

                if (redrawEdges && (uStrokeWeight !== uAdjustedWeight || vStrokeWeight !== vAdjustedWeight)) {
                    e.graphicsHead.clear();
                    e.graphicsTail.clear();
                    e.segmentsDrawn = 0;
                }
            }

            drawPathEdges(this.props.camera, this.props.path.edges);
        }
    }

    pathNodeRunner() {
        if (this.activePath) {
            if (this.props.path) {
                if (!this.pathHighlight.parent) {
                    this.nodes.addChild(this.pathHighlight);
                }
                return drawNodes(this.pathHighlight, this.props.path.nodes);
            }
            return 0;
        }
    }

    cleanPath(newActivePath) {
        if (newActivePath) {
            if (this.activePath) {
                //clear edges
                for (const e of this.activePath.edges) {
                    e.graphicsHead.clear();
                    e.graphicsTail.clear();
                }
                this.pathEdges.removeChildren();
                this.activePath.edges = null;

                //clear nodes
                for (const child of this.pathHighlight.children) {
                    child.visible = false;
                }
                this.nodes.removeChild(this.pathHighlight);
            }
            this.activePath = this.props.path;
        }
    }

    genreRunner() {
        if (this.props.genre) {
            if (!this.props.genre.graphics.parent) {
                this.genreFence.addChild(this.props.genre.graphics);
                this.props.genre.drawGenreFence();
            }

            if (!this.genreNodes.parent) {
                this.nodes.addChild(this.genreNodes);
            }

            drawNodes(this.genreNodes, this.props.genre.nodes);
        }
    }

    cleanGenre(newActiveGenre) {
        if (newActiveGenre) {
            if (this.activeGenre) {
                //clear graphics
                this.activeGenre.graphics.clear();
                this.genreFence.removeChildren();
                this.activeGenre.graphics = null;

                //clear nodes
                for (const child of this.genreNodes.children) {
                    child.visible = false;
                }
                this.nodes.removeChild(this.genreNodes);
            }
            this.activeGenre = this.props.genre;
        }
    }

    cleanArtists(newActiveArtist) {
        if (newActiveArtist) {
            if (this.activeArtist) {
                //clear edges
                for (const e of this.activeArtist.edges) {
                    e.graphicsHead.clear();
                    e.graphicsTail.clear();
                }
                this.edges.removeChildren();
                this.activeArtist.edges = null;

                //clear nodes
                for (const child of this.highlightNodes.children) {
                    child.visible = false;
                }
                this.nodes.removeChild(this.highlightNodes);
            }
            this.activeArtist = this.props.clickedArtist;
        }
    }

    relatedNodeRunner(drawArtist) {
        if (drawArtist) {
            if (!this.highlightNodes.parent) {
                this.nodes.addChild(this.highlightNodes);
            }
            return drawRelatedNodes(this.highlightNodes, this.props.clickedArtist);
        }
        return 0;
    }

    artistEdgeRunner(drawArtist, redrawEdges) {
        if (drawArtist) {
            //add edges to scene
            for (const e of this.props.clickedArtist.edges) {
                if (!e.graphicsHead.parent) {
                    this.edges.addChild(e.graphicsHead);
                    this.edges.addChild(e.graphicsTail);
                }

                const THRESHOLD = 0.5;
                const uStrokeWeight = e.u.size / STROKE_DIVIDER;
                const vStrokeWeight = e.v.size / STROKE_DIVIDER;
                const uAdjustedWeight = Math.max(uStrokeWeight, THRESHOLD / this.props.camera.getZoomFactor().x);
                const vAdjustedWeight = Math.max(vStrokeWeight, THRESHOLD / this.props.camera.getZoomFactor().x);

                if (redrawEdges && (uStrokeWeight !== uAdjustedWeight || vStrokeWeight !== vAdjustedWeight)) {
                    e.graphicsHead.clear();
                    e.graphicsTail.clear();
                    e.segmentsDrawn = 0;
                }
            }

            drawEdges(
                this.props.camera, this.props.clickedArtist.edges,
                this.props.clickedArtist, this.props.hoveredArtist, this.props.uiHover
            );
        }
    }

    runDebug() {
        if (this.props.showDebug) {
            this.app.stage.addChild(this.debug);
            Debug.debugAll(
                this.debug, this.app, this.props.camera, this.props.hoveredArtist,
                this.unloadedQuads, this.loadingQuads, this.unprocessedResponses, Object.keys(this.props.nodeLookup).length,
                this.quads, this.nodes, this.edges
            );
        } else {
            this.app.stage.removeChild(this.debug);
        }
    }

    hoveredArtist() {
        if (!this.props.uiHover) {
            const hA = getHoveredArtist(
                this.app, this.props.camera,
                this.props.clickedArtist, this.props.quadHead,
                this.props.genre, this.props.path, this.props.fence);
            if (hA) {
                this.props.setCursor('pointer');
            } else {
                this.props.setCursor('auto');
            }
            this.props.updateHoveredArtist(hA);
        }
    }

    quadProcessing() {
        drawOnscreenQuads(
            this.quads, this.realNodes, this.props.quadHead, this.props.camera,
            this.props.hoveredArtist, this.loadingQuads,
            this.unloadedQuads, this.unloadedPQ, this.props.showDebug
        );

        loadUnloaded(
            this.unprocessedResponses, this.unloadedPQ, this.loadingQuads,
            this.unloadedQuads, this.props.camera
        );

        if (this.frameCount % 5 === 0) {
            processOne(
                this.props.camera, this.props.quadHead,
                this.props.nodeLookup, this.loadingQuads, this.unprocessedResponses
            );
        }
    }

    cameraMoves() {
        //Ensure camera matches canvas even after resize
        this.props.camera.zoomCamera({x: 0, y: 0});
        MouseEvents.drift(this.props.camera, this.app);
        MouseEvents.zoom(this.props.camera);
        this.props.camera.bound(6000, 6000);
        this.props.camera.doCameraMove();

        const zoomFactor = this.props.camera.getZoomFactor() ;
        const xOffset = (this.app.screen.width / resolution) / 2 - (this.props.camera.x * zoomFactor.x / resolution);
        const yOffset = (this.app.screen.height / resolution) / 2 + (this.props.camera.y * zoomFactor.y / resolution);
        const scale = zoomFactor.x / resolution;

        this.mainStage.x = xOffset;
        this.mainStage.y = yOffset;
        this.mainStage.scale.set(scale);
    }

    setup() {
        //TODO set resolution to device default
        resolution = 1;
        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x030303,
            antialias: true,
            resolution: resolution,
        });


        PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.ON;

        this.canvas.appendChild(this.app.view);
        this.app.start();
        this.app.ticker.add(this.draw);

        this.quads = new PIXI.Container();
        this.debug = new PIXI.Container();
        this.debug.scale.set(1 / resolution);
        this.edges = new PIXI.Container();

        this.nodes = new PIXI.Container();
        this.realNodes = new PIXI.Container();
        this.genreNodes = new PIXI.Container();
        this.highlightNodes = new PIXI.Container();

        this.pathHighlight = new PIXI.Container();
        this.pathEdges = new PIXI.Container();

        this.genreFence = new PIXI.Container();

        this.regionFence = new PIXI.Graphics();

        this.darken = new Darken();

        this.mainStage = new PIXI.Container();
        this.mainStage.addChild(this.quads);
        this.mainStage.addChild(this.realNodes);

        this.mainStage.addChild(this.darken.genreGraphics);

        this.mainStage.addChild(this.genreFence);
        this.mainStage.addChild(this.genreNodes);

        this.mainStage.addChild(this.darken.spGraphics);

        this.mainStage.addChild(this.regionFence);

        this.mainStage.addChild(this.pathEdges);
        this.mainStage.addChild(this.pathHighlight);

        this.mainStage.addChild(this.darken.relatedGraphics);

        this.mainStage.addChild(this.edges);
        this.mainStage.addChild(this.nodes);

        this.app.stage.addChild(this.mainStage);

        const circleLoader = new PIXI.Loader();
        const highlightCircleLoader = new PIXI.Loader();
        highlightCircleLoader.add('highlightCircleTexture', '../../images/circle sprite semi-dark.png');
        highlightCircleLoader.load((loader, resources) => {
            this.highlightCircleTexture = resources.highlightCircleTexture.texture;

            for (let i = 0; i < 32; i++) {
                const node = new PIXI.Sprite(this.highlightCircleTexture);
                node.anchor.set(0.5);
                node.visible = false;
                this.highlightNodes.addChild(node);
            }

            for (let i = 0; i < 512; i++) {
                const node = new PIXI.Sprite(this.highlightCircleTexture);
                node.anchor.set(0.5);
                node.visible = false;
                this.genreNodes.addChild(node);
            }

            for (let i = 0; i < 32; i++) {
                const node = new PIXI.Sprite(this.highlightCircleTexture);
                node.anchor.set(0.5);
                node.visible = false;
                this.pathHighlight.addChild(node);
            }
        });

        const POOL_SIZE = 5096;
        circleLoader.add('circleTexture', '../../images/circle sprite.png');
        circleLoader.load((loader, resources) => {
            this.circleTexture = resources.circleTexture.texture;

            for (let i = 0; i < POOL_SIZE; i++) {
                const node = new PIXI.Sprite(this.circleTexture);
                node.anchor.set(0.5);
                node.visible = false;
                this.realNodes.addChild(node);
            }
        });

        const camera = new Camera(
            0, 0, window.innerHeight, window.innerWidth,
            1, this.app.screen, resolution);
        this.props.setCamera(camera);

        //TODO check this out, is camera.x being evaluated at declaration??
        this.unloadedPQ = new PriorityQueue(
            (a, b) => Utils.dist(camera.x, camera.y, a.x, a.y) - Utils.dist(camera.x, camera.y, b.x, b.y)
        );

        loadInitialQuads(this.loadingQuads, this.unprocessedResponses).then((qH) => {
            this.props.setQuadHead(qH);
            this.loading = false

            if (window.location.hash) {
                this.props.processHash(window.location.hash.replace("#", ""));
            }
        });
    }

    addFencepost(dragging) {
        this.props.setFencing(true, null);

        let postPoint = MouseEvents.getVirtualMouseCoordinates(this.app, this.props.camera);
        let firstPoint = {x: Infinity, y: Infinity}

        if (this.props.fence.length > 0) {
            firstPoint = this.props.fence[0];
        }

        const postFirstDist = Utils.dist(postPoint.x, postPoint.y, firstPoint.x, firstPoint.y);
        const validDist = Math.max(
            FENCE_CLICK_MIN_VIRTUAL_RADIUS * 2,
            (FENCE_CLICK_RADIUS * 2) / this.props.camera.getZoomFactor().x
        );

        let intersection = null;
        if (this.props.fence.length > 0) {
            const u = this.props.fence[this.props.fence.length - 1];
            intersection = Utils.lineCurveIntersection(this.props.fence, {u: u, v: postPoint});
        }

        if (intersection) {
            this.props.processIntersection(intersection);
            this.dragDrawing = false;
            MouseEvents.dragging = false;
            return;
        }

        if (dragging) {
            //Play by different rules
            if (this.props.fence.length === 0) {
                this.props.addFencepost(postPoint, null);
                return;
            }

            const lastPoint = this.props.fence[this.props.fence.length - 1];
            const dist = Utils.dist(postPoint.x, postPoint.y, lastPoint.x, lastPoint.y);
            const DRAG_THRESHOLD = 0.25;
            if (dist > DRAG_THRESHOLD) {
                this.props.addFencepost(postPoint, null);
            }
        } else {
            if (postFirstDist < validDist / 2) {
                if (this.props.fence.length > 2) {
                    let postPoint = this.props.fence[0];
                    this.props.addFencepost(postPoint, null);
                } else {
                    this.props.clearFence();
                }
            } else {
                this.props.addFencepost(postPoint, null);
            }
        }
    }

    keyReleaseHandler(e) {
        if (e.key === "Control" && (this.props.fencing || this.dragDrawing)) {
            this.props.clearFence();
            this.dragDrawing = false;
        }
    }

    componentDidMount() {
        this.clickedLoading = false;

        this.unprocessedResponses = [];
        this.unloadedQuads = new Set();
        this.loadingQuads = new Set();

        document.addEventListener('keyup', this.keyReleaseHandler);

        this.setup();
    }

    componentWillUnmount() {
        this.app.stop();
    }

    captureWheel(e) {
        if (this.props.uiHover) {
            return;
        }

        //TODO fix
        //const isTouchPad = e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0
        const isTouchPad = false;
        if (isTouchPad && !e.ctrlKey) {
            this.props.camera.x += e.deltaX * (1 / this.props.camera.getZoomFactor().x);
            this.props.camera.y -= e.deltaY * (1 / this.props.camera.getZoomFactor().y);
        } else {
            MouseEvents.zooming = true;
            MouseEvents.scrollStep = 0;
            MouseEvents.zoomCoordinates = MouseEvents.getVirtualMouseCoordinates(this.app, this.props.camera);
            if (e.ctrlKey && Math.abs(e.deltaY) < 10) {
                MouseEvents.scrollDelta = e.deltaY / 10;
            } else {
                MouseEvents.scrollDelta = e.deltaY / 300;
            }
        }
    }

    mousePressed(e) {
        const point = this.app.renderer.plugins.interaction.mouse.global;
        MouseEvents.speed = {x: 0, y: 0};
        if (!this.props.uiHover) {
            MouseEvents.dragging = true;
            MouseEvents.drag = {x: point.x, y: point.y};
            MouseEvents.start = {x: point.x, y: point.y};
            MouseEvents.startTime = new Date().getTime();
        }
    }

    mouseMove(e) {
        if (this.props.uiHover) {
            this.props.updateHoverFlag(false);
        }

        if (MouseEvents.dragging) {
            const newDrag = MouseEvents.getVirtualMouseCoordinates(this.app, this.props.camera);
            const oldDrag = this.props.camera.screen2virtual(MouseEvents.drag);
            const point = this.app.renderer.plugins.interaction.mouse.global;
            MouseEvents.drag = {x: point.x, y: point.y};
            MouseEvents.updateSpeed({x: e.movementX * 3, y: e.movementY * 3});
            const currentTime = new Date().getTime();
            if (e.ctrlKey) {
                const dragDist = Utils.dist(MouseEvents.start.x, MouseEvents.start.y, MouseEvents.drag.x, MouseEvents.drag.y);
                const smallDrag = dragDist < 10;
                if (!smallDrag) {
                    this.dragDrawing = true;
                }

                if (this.dragDrawing) {
                    this.addFencepost(true);
                }
            } else {
                this.props.camera.x += (oldDrag.x - newDrag.x);
                this.props.camera.y += (oldDrag.y - newDrag.y);
            }

            if (!e.ctrlKey && this.dragDrawing) {
                this.dragDrawing = false;
                if (this.props.fence.length > 2) {
                    const postPoint = this.props.fence[0];
                    this.props.addFencepost(postPoint, null);
                } else {
                    this.props.clearFence();
                }
            }
        }
    }

    mouseReleased(e) {
        if (MouseEvents.dragging) {
            const newDrag = MouseEvents.getVirtualMouseCoordinates(this.app, this.props.camera);
            const oldDrag = this.props.camera.screen2virtual(MouseEvents.drag);

            if (!e.ctrlKey) {
                this.props.camera.x += (oldDrag.x - newDrag.x);
                this.props.camera.y += (oldDrag.y - newDrag.y);
            }

            const dragDist = Utils.dist(MouseEvents.start.x, MouseEvents.start.y, MouseEvents.drag.x, MouseEvents.drag.y);
            const smallDrag = dragDist < 5;
            MouseEvents.updateSpeed({x: e.movementX * 3, y: e.movementY * 3});

            if (smallDrag) {
                const clickTime = new Date().getTime();
                const isDoubleClick = MouseEvents.isDoubleClick(clickTime);
                MouseEvents.lastClickTime = clickTime;

                if (e.ctrlKey) { // Fence Click
                    this.addFencepost(false);
                } else if (isDoubleClick) {
                    MouseEvents.zooming = true;
                    MouseEvents.scrollStep = 0;
                    MouseEvents.zoomCoordinates = {x: newDrag.x, y: newDrag.y};
                    MouseEvents.scrollDelta = -0.5;
                } else {
                    if (this.props.hoveredArtist) {
                        this.props.updateClickedArtist(this.props.hoveredArtist);
                    } else {
                        this.props.handleEmptyClick();
                    }

                    this.props.clearFence();
                }
            }

            if (e.ctrlKey && this.dragDrawing && this.props.fence.length > 2) {
                const postPoint = this.props.fence[0];
                this.props.addFencepost(postPoint, null);
            }

            if (!e.ctrlKey) {
                MouseEvents.driftVec = {
                    x: MouseEvents.speed.x,
                    y: MouseEvents.speed.y,
                };
                MouseEvents.drifting = true;
            }
            MouseEvents.dragging = false;
        }
        this.dragDrawing = false;
    }

    render() {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                }}
                ref={r => {this.canvas = r}}
                onWheel={this.captureWheel}
                onMouseDown={this.mousePressed}
                onMouseMove={this.mouseMove}
                onMouseUp={this.mouseReleased}
            >

            </div>
        );
    }
}