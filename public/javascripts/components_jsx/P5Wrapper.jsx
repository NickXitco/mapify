class P5Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef()
        this.loading = true;
        this.dragDrawing = false;
    }

    Sketch = (p) => {
        p.setup = () => {
            const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
            canvas.mouseOver(() => {this.props.updateHoverFlag(false)});

            const camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 1, this.props.p5);
            this.props.setCamera(camera);
            this.unloadedPQ = new PriorityQueue((a, b) => Utils.dist(camera.x, camera.y, a.x, a.y)
                                                                  - Utils.dist(camera.x, camera.y, b.x, b.y));

            loadInitialQuads(this.loadingQuads, this.unprocessedResponses).then((qH) => {
                this.props.setQuadHead(qH);
                this.loading = false

                if (window.location.hash) {
                    this.props.processHash(window.location.hash.replace("#", ""));
                }
            });

            // this.dustBunnies = DustBunny.createDustBunnies(10000, 5000, 500);

            p.angleMode(p.DEGREES);
            p.rectMode(p.RADIUS);
        };

        p.draw = () => {
            if (this.loading) {
                drawLoading();
                return;
            }

            p.background(3);

            Debug.resetTiming();
            Debug.createTimingEvent("Drawing Setup");

            MouseEvents.drift(this.props.camera, p);
            MouseEvents.zoom(this.props.camera);


            this.props.camera.doCameraMove();

            p.push();
            this.props.camera.setView();

            Debug.createTimingEvent("Camera Moves");

            drawOnscreenQuads(p, this.props.quadHead, this.props.camera, this.props.hoveredArtist, this.loadingQuads, this.unloadedQuads, this.unloadedPQ, this.props.showDebug);

            // DustBunny.drawBunnies(this.dustBunnies, p, this.props.camera);
            // Debug.createTimingEvent("Dust Bunnies");

            loadUnloaded(this.unprocessedResponses, this.unloadedPQ, this.loadingQuads, this.unloadedQuads, this.props.camera);

            if (!this.props.uiHover) {
                const hA = getHoveredArtist(
                    p, this.props.camera,
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
                loadArtist(p, this.props.clickedArtist, this.props.quadHead, this.props.nodeLookup).then(() => {this.clickedLoading = false});
            }

            Debug.createTimingEvent("Get Hovered Artist");

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
                let postPoint = MouseEvents.getVirtualMouseCoordinates(p, this.props.camera);
                let firstPoint = {x: Infinity, y: Infinity}

                if (this.props.fence.length > 0) {
                    firstPoint = this.props.fence[0];
                }

                const postFirstDist = Utils.dist(postPoint.x, postPoint.y, firstPoint.x, firstPoint.y);
                const validDist = Math.max(FENCE_CLICK_MIN_VIRTUAL_RADIUS * 2, (FENCE_CLICK_RADIUS * 2) / this.props.camera.getZoomFactor().x);

                if (this.props.fencing) {
                    if (postFirstDist < validDist / 2 && this.props.fence.length > 2) {
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

                let signedArea = 0;

                for (let i = 0; i < this.props.fence.length - 1; i++) {
                    const point = this.props.fence[i];
                    const nextPoint = this.props.fence[i + 1];
                    signedArea += (point.x * (-nextPoint.y) - nextPoint.x * (-point.y));
                }

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

            if (p.frameCount % 5 === 0) {
                processOne(p, this.props.camera, this.props.quadHead, this.props.nodeLookup, this.loadingQuads, this.unprocessedResponses);
            }

            Debug.createTimingEvent("Quad Processing");

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

        p.mouseWheel = (e) => {
            if (this.props.uiHover) {
                return;
            }
            e.preventDefault();

            const isTouchPad = e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0

            if (isTouchPad && !e.ctrlKey) {
                this.props.camera.x -= e.deltaX * (1 / this.props.camera.getZoomFactor().x);
                this.props.camera.y += e.deltaY * (1 / this.props.camera.getZoomFactor().y);
            } else {
                MouseEvents.zooming = true;
                MouseEvents.scrollStep = 0;
                MouseEvents.zoomCoordinates = MouseEvents.getVirtualMouseCoordinates(p, this.props.camera);
                if (e.ctrlKey && Math.abs(e.deltaY) < 10) {
                    MouseEvents.scrollDelta = e.deltaY / 10;
                } else {
                    MouseEvents.scrollDelta = e.deltaY / 300;
                }
            }
        }

        p.mousePressed = (e) => {
            if (!this.props.uiHover) {
                MouseEvents.dragging = true;
                MouseEvents.drag = {x: p.mouseX, y: p.mouseY};
                MouseEvents.start = {x: p.mouseX, y: p.mouseY};
                MouseEvents.startTime = new Date().getTime();
            }
        }

        p.addFencepost = (dragging) => {
            this.props.setFencing(true, null);

            let postPoint = MouseEvents.getVirtualMouseCoordinates(p, this.props.camera);
            let firstPoint = {x: Infinity, y: Infinity}

            if (this.props.fence.length > 0) {
                firstPoint = this.props.fence[0];
            }

            const postFirstDist = Utils.dist(postPoint.x, postPoint.y, firstPoint.x, firstPoint.y);
            const validDist = Math.max(FENCE_CLICK_MIN_VIRTUAL_RADIUS * 2, (FENCE_CLICK_RADIUS * 2) / this.props.camera.getZoomFactor().x);

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

        p.mouseDragged = (e) => {
            if (MouseEvents.dragging) {
                const newDrag = MouseEvents.getVirtualMouseCoordinates(p, this.props.camera);
                const oldDrag = this.props.camera.screen2virtual(MouseEvents.drag);
                MouseEvents.drag = {x: p.mouseX, y: p.mouseY};
                const currentTime = new Date().getTime();
                if (e.ctrlKey) {
                    const dragDist = Utils.dist(MouseEvents.start.x, MouseEvents.start.y, MouseEvents.drag.x, MouseEvents.drag.y);
                    const smallDrag = dragDist < 10;
                    if (!smallDrag) {
                        p.addFencepost(true);
                        this.dragDrawing = true;
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

        p.mouseReleased = (e) => {
            if (MouseEvents.dragging) {
                const newDrag = MouseEvents.getVirtualMouseCoordinates(p, this.props.camera);
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
                        p.addFencepost();
                    } else if (isDoubleClick) {
                        MouseEvents.zooming = true;
                        MouseEvents.scrollStep = 0;
                        MouseEvents.zoomCoordinates = {x: newDrag.x, y: newDrag.y};
                        MouseEvents.scrollDelta = -0.5;
                    } else {
                        const clickedArtist = handlePointClick(this.props.quadHead, this.props.hoveredArtist, this.props.clickedArtist, this.props.nodeLookup, p);
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
                    MouseEvents.driftVec = p.createVector(p.winMouseX - p.pwinMouseX, p.winMouseY - p.pwinMouseY);
                    MouseEvents.drifting = true;
                }
                MouseEvents.dragging = false;
            }
            this.dragDrawing = false;
        }

        p.keyPressed = (e) => {
            this.props.keyDownEvents(e);
        }
    }

    componentDidMount() {
        this.props.setCanvas(new p5(this.Sketch, this.myRef.current));

        this.clickedLoading = false;

        this.darken = {
            related: 0,
            genre: 0,
            sp: 0
        }


        this.unprocessedResponses = [];
        this.unloadedQuads = new Set();
        this.loadingQuads = new Set();
    }

    render() {
        return (
            <div ref={this.myRef}>

            </div>
        );
    }
}