class P5Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef()
        this.loading = true;
        this.dragDrawing = false;
        this.frameCount = 0;


        this.setup = this.setup.bind(this);
        this.draw = this.draw.bind(this);
        this.captureWheel = this.captureWheel.bind(this);
        this.mousePressed = this.mousePressed.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseReleased = this.mouseReleased.bind(this);
        this.keyPressed = this.keyPressed.bind(this);
    }

    Sketch = (p) => {
        p.setup = () => {
            canvas.mouseOver(() => {this.props.updateHoverFlag(false)});

            // this.dustBunnies = DustBunny.createDustBunnies(10000, 5000, 500);

            p.angleMode(p.DEGREES);
            p.rectMode(p.RADIUS);
        };

        p.draw = () => {
            if (!this.props.clickedArtist && !this.props.genre && this.props.path.nodes.length === 0) {
                this.darken = {
                    related: 0,
                    genre: 0,
                    sp: 0
                }
            }

            if (this.props.genre) {
                this.darken.genre = darkenScene(p, this.darken.genre, this.props.camera);
            }

            if (this.props.genre) {
                this.props.genre.drawGenreFence(p, this.props.showDebug);
                drawNodes(p, this.props.camera, this.props.genre.nodes);
            }

            Debug.createTimingEvent("Draw Genre Nodes");

            if (this.props.fence.length > 0) {
                let postPoint = MouseEvents.getVirtualMouseCoordinates(this.app, this.props.camera);
                let firstPoint = {x: Infinity, y: Infinity}

                if (this.props.fence.length > 0) {
                    firstPoint = this.props.fence[0];
                }

                const postFirstDist = Utils.dist(postPoint.x, postPoint.y, firstPoint.x, firstPoint.y);
                const validDist = Math.max(FENCE_CLICK_MIN_VIRTUAL_RADIUS * 2, (FENCE_CLICK_RADIUS * 2) / this.props.camera.getZoomFactor().x);

                if (this.props.fencing) {
                    if (postFirstDist < validDist / 2 && this.props.fence.length > 2 && !this.dragDrawing) {
                        this.props.setCursor('pointer');
                    } else {
                        this.props.setCursor('auto');
                    }
                }

                p.push();

                p.stroke('white');

                p.strokeWeight(Math.max(0.5, 1 / this.props.camera.getZoomFactor().x));

                p.beginShape();

                for (const point of this.props.fence) {
                    p.noFill();
                    //p.circle(point.x, -point.y, Math.max(FENCE_CLICK_MIN_VIRTUAL_RADIUS * 2, (FENCE_CLICK_RADIUS * 2) / this.props.camera.getZoomFactor().x));
                    p.vertex(point.x, -point.y);
                    //p.fill('white');

                    if (this.props.fencing && !this.dragDrawing) {
                        p.square(point.x, -point.y, Math.max(1, 2 / this.props.camera.getZoomFactor().x));
                    }
                }
                p.noFill();
                //p.vertex(this.props.fence[0].x, -this.props.fence[0].y);
                p.endShape();

                let signedArea = Utils.signedArea(this.props.fence);

                let fence = [...this.props.fence];
                if (signedArea > 0) {
                    fence = fence.reverse();
                }

                if (!this.props.fencing && fence.length > 2) {
                    p.fill(0, 200);
                    p.noStroke();
                    p.beginShape();
                    p.vertex(-20000, -20000);
                    p.vertex(20000, -20000);
                    p.vertex(20000, 20000);
                    p.vertex(-20000, 20000);
                    p.beginContour();
                    for (let i = 0; i < fence.length - 1; i++) {
                        const point = fence[i];
                        p.vertex(point.x, -point.y);
                    }
                    p.endContour();
                    p.endShape();
                }

                p.pop();
            }


            if (this.props.clickedArtist) {
                this.darken.related = darkenScene(p, this.darken.related, this.props.camera);
            }

            if (this.props.clickedArtist && this.props.clickedArtist.loaded) {
                drawEdges(p, this.props.camera, this.props.clickedArtist.edges, this.props.clickedArtist, this.props.hoveredArtist, this.props.uiHover);

                Debug.createTimingEvent("Draw Related Edges");
                drawRelatedNodes(p, this.props.camera, this.props.clickedArtist);

                Debug.createTimingEvent("Draw Related Nodes");
            }

            if (this.props.path.nodes.length > 0) {
                this.darken.sp = darkenScene(p, this.darken.sp, this.props.camera);

                drawPathEdges(p, this.props.camera, this.props.path.edges);
                Debug.createTimingEvent("Draw SP Edges");
                drawNodes(p, this.props.camera, this.props.path.nodes);
                Debug.createTimingEvent("Draw SP Nodes");

            }

            Debug.createTimingEvent("Sidebar");

            p.pop();
            Debug.createTimingEvent("Info Box");
            if (this.props.showDebug) {
                Debug.debugAll(
                    p,
                    this.props.camera,
                    this.props.hoveredArtist,
                    this.unloadedQuads,
                    this.loadingQuads,
                    this.unprocessedResponses,
                    Object.keys(this.props.nodeLookup).length,
                );
            }
        };

        p.addFencepost = (dragging) => {
            this.props.setFencing(true, null);

            let postPoint = MouseEvents.getVirtualMouseCoordinates(this.app, this.props.camera);
            let firstPoint = {x: Infinity, y: Infinity}

            if (this.props.fence.length > 0) {
                firstPoint = this.props.fence[0];
            }

            const postFirstDist = Utils.dist(postPoint.x, postPoint.y, firstPoint.x, firstPoint.y);
            const validDist = Math.max(FENCE_CLICK_MIN_VIRTUAL_RADIUS * 2, (FENCE_CLICK_RADIUS * 2) / this.props.camera.getZoomFactor().x);

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
                    this.props.addFencepost(postPoint);
                    return;
                }

                const lastPoint = this.props.fence[this.props.fence.length - 1];
                const dist = Utils.dist(postPoint.x, postPoint.y, lastPoint.x, lastPoint.y);
                const DRAG_THRESHOLD = 0.25;
                if (dist > DRAG_THRESHOLD) {
                    this.props.addFencepost(postPoint);
                }
            } else {
                if (postFirstDist < validDist / 2) {
                    if (this.props.fence.length > 2) {
                        let postPoint = this.props.fence[0];
                        this.props.addFencepost(postPoint);
                        this.props.setFencing(false, null);
                    } else {
                        this.props.clearFence();
                        this.props.setFencing(false, null);
                    }
                } else {
                    this.props.addFencepost(postPoint);
                }
            }
        }

        p.keyPressed = (e) => {
            this.props.keyDownEvents(e);
        }

        p.keyReleased = (e) => {
            if (e.key === "Control" && (this.props.fencing || this.dragDrawing)) {
                this.props.clearFence();
                this.props.setFencing(false, null);
                this.dragDrawing = false;
            }
        }
    }

    componentDidMount() {
        //this.props.setCanvas(new p5(this.Sketch, this.myRef.current));

        this.clickedLoading = false;

        this.darken = {
            related: 0,
            genre: 0,
            sp: 0
        }


        this.unprocessedResponses = [];
        this.unloadedQuads = new Set();
        this.loadingQuads = new Set();

        this.setup();
    }

    componentWillUnmount() {
        this.app.stop();
    }

    draw() {
        this.frameCount++;
        if (this.loading) {
            drawLoading();
            return;
        }

        if (this.props.resize) {
            console.log("resize");
            this.props.camera.zoomCamera({x: this.props.camera.x, y: this.props.camera.y});
            this.props.resetResize();
        }

        Debug.resetTiming();

        MouseEvents.drift(this.props.camera, this.app);
        MouseEvents.zoom(this.props.camera);
        this.props.camera.bound(6000, 6000);
        this.props.camera.doCameraMove();

        const zoomFactor = this.props.camera.getZoomFactor();
        const xOffset = this.app.screen.width / 2 - (this.props.camera.x * zoomFactor.x);
        const yOffset = this.app.screen.height / 2 + (this.props.camera.y * zoomFactor.y);
        const scale = zoomFactor.x;

        this.mainStage.x = xOffset;
        this.mainStage.y = yOffset;
        this.mainStage.scale.set(scale);

        Debug.createTimingEvent("Camera Moves");

        drawOnscreenQuads(
            this.quads, this.props.quadHead, this.props.camera,
            this.props.hoveredArtist, this.loadingQuads,
            this.unloadedQuads, this.unloadedPQ, this.props.showDebug
        );

        loadUnloaded(
            this.unprocessedResponses, this.unloadedPQ, this.loadingQuads,
            this.unloadedQuads, this.props.camera
        );

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

        if (this.props.clickedArtist && !this.props.clickedArtist.loaded && !this.clickedLoading) {
            this.clickedLoading = true;
            loadArtist(
                this.props.clickedArtist, this.props.quadHead, this.props.nodeLookup
            ).then(() => {this.clickedLoading = false});
        }

        Debug.createTimingEvent("Get Hovered Artist");

        // DustBunny.drawBunnies(this.dustBunnies, p, this.props.camera);
        // Debug.createTimingEvent("Dust Bunnies");

        if (this.frameCount % 5 === 0) {
            processOne(
                this.props.camera, this.props.quadHead,
                this.props.nodeLookup, this.loadingQuads, this.unprocessedResponses
            );
        }

        Debug.createTimingEvent("Quad Processing");

        if (!this.props.clickedArtist && this.nodes.children.length > 0) {
            this.nodes.removeChildren();
        }

        if (this.props.clickedArtist && this.props.clickedArtist.loaded) {
            // drawEdges(
            //     p, this.props.camera, this.props.clickedArtist.edges,
            //     this.props.clickedArtist, this.props.hoveredArtist, this.props.uiHover
            // );

            Debug.createTimingEvent("Draw Related Edges");

            // if (this.nodes.children.length === 0) {
            //     drawRelatedNodes(this.nodes, this.props.camera, this.props.clickedArtist);
            // }

            Debug.createTimingEvent("Draw Related Nodes");
        }

        if (this.props.showDebug) {
            Debug.debugAll(
                this.debug,
                this.app,
                this.props.camera,
                this.props.hoveredArtist,
                this.unloadedQuads,
                this.loadingQuads,
                this.unprocessedResponses,
                Object.keys(this.props.nodeLookup).length,
                this.quads,
                this.nodes,
                this.edges
            );
        }
    }

    setup() {
        this.app = new PIXI.Application({ resizeTo: window , backgroundColor: 0x030303});
        this.canvas.appendChild(this.app.view);
        this.app.start();
        this.app.ticker.add(this.draw);

        this.quads = new PIXI.Container();
        this.debug = new PIXI.Container();
        this.nodes = new PIXI.Container();
        this.edges = new PIXI.Container();

        this.mainStage = new PIXI.Container();
        this.mainStage.addChild(this.quads);
        this.mainStage.addChild(this.nodes);
        this.mainStage.addChild(this.edges);

        this.app.stage.addChild(this.mainStage);
        this.app.stage.addChild(this.debug);

        const camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 1, this.app.screen);
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
            MouseEvents.speed = {x: e.movementX, y: e.movementY};
            const currentTime = new Date().getTime();
            if (e.ctrlKey) {
                const dragDist = Utils.dist(MouseEvents.start.x, MouseEvents.start.y, MouseEvents.drag.x, MouseEvents.drag.y);
                const smallDrag = dragDist < 10;
                if (!smallDrag) {
                    this.dragDrawing = true;
                }

                if (this.dragDrawing) {
                    //TODO implement
                    //p.addFencepost(true);
                }
            } else {
                this.props.camera.x += (oldDrag.x - newDrag.x);
                this.props.camera.y += (oldDrag.y - newDrag.y);
            }

            if (!e.ctrlKey && this.dragDrawing) {
                this.dragDrawing = false;
                if (this.props.fence.length > 2) {
                    const postPoint = this.props.fence[0];
                    this.props.addFencepost(postPoint);
                    this.props.setFencing(false, null);
                } else {
                    this.props.clearFence();
                    this.props.setFencing(false, null);
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

            if (smallDrag) {
                const clickTime = new Date().getTime();
                const isDoubleClick = MouseEvents.isDoubleClick(clickTime);
                MouseEvents.lastClickTime = clickTime;

                if (e.ctrlKey) { // Fence Click
                    //TODO implement
                    //p.addFencepost();
                } else if (isDoubleClick) {
                    MouseEvents.zooming = true;
                    MouseEvents.scrollStep = 0;
                    MouseEvents.zoomCoordinates = {x: newDrag.x, y: newDrag.y};
                    MouseEvents.scrollDelta = -0.5;
                } else {
                    const clickedArtist = handlePointClick(this.props.quadHead, this.props.hoveredArtist,);
                    if (clickedArtist) {
                        this.props.updateClickedArtist(clickedArtist);

                    } else {
                        this.props.handleEmptyClick();
                    }

                    this.props.clearFence();
                    this.props.setFencing(false, null);
                }
            }

            if (e.ctrlKey && this.dragDrawing && this.props.fence.length > 2) {
                const postPoint = this.props.fence[0];
                this.props.addFencepost(postPoint);
                this.props.setFencing(false, null);
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

    keyPressed(e) {
        //TODO this doesn't work. Move to a document listener
        this.props.keyDownEvents(e);
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