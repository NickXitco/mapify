class P5Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef()
        this.loading = true;
    }

    Sketch = (p) => {
        p.setup = () => {
            const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
            canvas.mouseOver(() => {this.props.updateHoverFlag(false)})

            this.props.canvasUpdate(canvas);

            camera.zoomCamera({x: 0, y: 0});

            loadInitialQuads(this.loadingQuads, this.unprocessedResponses).then((qH) => {
                quadHead = qH;
                this.loading = false
            });

            p.angleMode(p.DEGREES);
            p.rectMode(p.RADIUS);

            if (!VersionHelper.checkVersion()) {
                VersionHelper.drawChangelog();
            }
        };

        p.draw = () => {
            if (this.loading) {
                drawLoading();
                return;
            }

            p.background(3);

            Debug.resetTiming();
            Debug.createTimingEvent("Drawing Setup");

            MouseEvents.drift(camera, p);
            MouseEvents.zoom(camera);


            camera.doCameraMove();

            p.push();
            camera.setView();

            Debug.createTimingEvent("Camera Moves");

            drawOnscreenQuads(p, quadHead, camera, hoveredArtist, this.loadingQuads, this.unloadedQuads, this.unloadedPQ);

            loadUnloaded(this.unprocessedResponses, this.unloadedPQ, this.loadingQuads, this.unloadedQuads);

            if (!this.props.uiHover) {
                hoveredArtist = getHoveredArtist(p, camera, clickedArtist, quadHead);
                this.props.updateHoveredArtist(hoveredArtist);
            }

            if (clickedArtist && !clickedArtist.loaded && !this.clickedLoading) {
                this.clickedLoading = true;
                loadArtist(p, clickedArtist, quadHead, nodeLookup).then(() => {this.clickedLoading = false});
            }

            Debug.createTimingEvent("Get Hovered Artist");

            if (!clickedArtist && GenreHelpers.genreNodes.size === 0) {
                this.darkenOpacity = 0;
            }

            if (GenreHelpers.genreNodes.size > 0) {
                this.darkenOpacity = darkenScene(p, this.darkenOpacity, camera);
            }

            Debug.createTimingEvent("Darken Scene for Genre Nodes");

            if (GenreHelpers.genreNodes.size > 0) {

                p.push();
                p.noStroke();
                p.fill(GenreHelpers.genreColor);
                p.textSize(50);
                p.textAlign(p.CENTER);
                p.text(GenreHelpers.genreName, GenreHelpers.genrePoint.x, -GenreHelpers.genrePoint.y);

                p.stroke(GenreHelpers.genreColor);
                p.noFill();
                p.strokeWeight(2);
                p.beginShape();

                const shiftedHull = GenreHelpers.offsetHull(GenreHelpers.genreHull, GenreHelpers.genrePoint, 20);
                for (const point of shiftedHull) {
                    p.vertex(point.x, -point.y);
                }
                p.vertex(shiftedHull[0].x, -shiftedHull[0].y);
                p.endShape();

                p.pop();

                drawNodes(p, camera, GenreHelpers.genreNodes);
            }

            Debug.createTimingEvent("Draw Genre Nodes");

            if (clickedArtist) {
                this.darkenOpacity = darkenScene(p, this.darkenOpacity, camera);
            }

            Debug.createTimingEvent("Darken Scene for Related Nodes");

            if (clickedArtist && clickedArtist.loaded) {
                if (clickedArtist.relatedVertices.size > 0) {
                    if (clickedArtist.edges.length === 0) {
                        clickedArtist.edges = makeEdges(clickedArtist);
                        this.props.updateClickedArtist(clickedArtist); //TODO why is this here
                    } else {
                        drawEdges(p, camera, clickedArtist.edges, clickedArtist, hoveredArtist);
                    }
                }

                Debug.createTimingEvent("Draw Related Edges");
                drawRelatedNodes(p, camera, clickedArtist);
                Debug.createTimingEvent("Draw Related Nodes");
            }

            if (clickedArtist && clickedArtist.loaded && Sidebar.artist !== clickedArtist) {
                Sidebar.setArtistSidebar(p, camera, clickedArtist, quadHead, nodeLookup);
            }

            if (clickedArtist && Sidebar.openAmount < 1) {
                Sidebar.openSidebar();
            }

            Debug.createTimingEvent("Sidebar");

            if (p.frameCount % 5 === 0) { //TODO adjust this until it feels right, or adjust it dynamically?
                processOne(p, camera, quadHead, nodeLookup, this.loadingQuads, this.unprocessedResponses);
            }

            Debug.createTimingEvent("Quad Processing");

            p.pop();

            Debug.createTimingEvent("Info Box");
            Debug.debugAll(p, camera, hoveredArtist, this.unloadedQuads, this.loadingQuads, this.unprocessedResponses);
        };

        p.mouseWheel = (e) => {
            if (this.props.uiHover) {
                return;
            }
            e.preventDefault();

            const isTouchPad = e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0

            if (isTouchPad && !e.ctrlKey) {
                camera.x -= e.deltaX * (1 / camera.getZoomFactor().x);
                camera.y += e.deltaY * (1 / camera.getZoomFactor().y);
            } else {
                MouseEvents.zooming = true;
                MouseEvents.scrollStep = 0;
                MouseEvents.zoomCoordinates = MouseEvents.getVirtualMouseCoordinates(p, camera);
                if (e.ctrlKey && Math.abs(e.deltaY) < 10) {
                    MouseEvents.scrollDelta = e.deltaY / 10;
                } else {
                    MouseEvents.scrollDelta = e.deltaY / 300;
                }
            }
        }

        p.mousePressed = () => {
            if (!this.props.uiHover) {
                MouseEvents.dragging = true;
                MouseEvents.drag = {x: p.mouseX, y: p.mouseY};
                MouseEvents.start = {x: p.mouseX, y: p.mouseY};
            }
        }

        p.mouseDragged = () => {
            if (MouseEvents.dragging) {
                const newDrag = MouseEvents.getVirtualMouseCoordinates(p, camera);
                const oldDrag = camera.screen2virtual(MouseEvents.drag);
                camera.x += (oldDrag.x - newDrag.x);
                camera.y += (oldDrag.y - newDrag.y);
                MouseEvents.drag = {x: p.mouseX, y: p.mouseY};
            }
        }

        p.mouseReleased = () => {
            if (MouseEvents.dragging) {
                const newDrag = MouseEvents.getVirtualMouseCoordinates(p, camera);
                const oldDrag = camera.screen2virtual(MouseEvents.drag);
                camera.x += (oldDrag.x - newDrag.x);
                camera.y += (oldDrag.y - newDrag.y);

                if (Utils.dist(MouseEvents.start.x, MouseEvents.start.y, MouseEvents.drag.x, MouseEvents.drag.y) < 5) {
                    clickedArtist = handlePointClick(quadHead, hoveredArtist, clickedArtist, nodeLookup, p);
                    if (!clickedArtist) {
                        this.props.unsetClickedArtist();
                    }
                    this.newEdges = Boolean(clickedArtist);
                }

                MouseEvents.driftVec = p.createVector(p.winMouseX - p.pwinMouseX, p.winMouseY - p.pwinMouseY);
                MouseEvents.drifting = true;
                MouseEvents.dragging = false;
            }
        }
    }

    componentDidMount() {
        p = new p5(this.Sketch, this.myRef.current);
        camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 1, p);

        this.clickedLoading = false;
        this.darkenOpacity = 0;

        this.unprocessedResponses = [];
        this.unloadedQuads = new Set();
        this.loadingQuads = new Set();
        this.unloadedPQ = new PriorityQueue((a, b) => Utils.dist(camera.x, camera.y, a.x, a.y) - Utils.dist(camera.x, camera.y, b.x, b.y));
    }

    render() {
        return (
            <div ref={this.myRef}>

            </div>
        );
    }
}