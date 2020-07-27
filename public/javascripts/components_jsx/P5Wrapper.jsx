class P5Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef()
        this.loading = true;
    }

    Sketch = (p) => {
        p.setup = () => {
            console.log('P5 Setup');
            console.log(window.innerWidth);
            const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
            canvas.mouseOver(() => {this.props.updateHoverFlag(false)});

            const camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 1, this.props.p5);
            this.props.setCamera(camera);
            this.unloadedPQ = new PriorityQueue((a, b) => Utils.dist(camera.x, camera.y, a.x, a.y)
                                                                  - Utils.dist(camera.x, camera.y, b.x, b.y));

            loadInitialQuads(this.loadingQuads, this.unprocessedResponses).then((qH) => {
                this.props.setQuadHead(qH);
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
                console.log('P5 Draw');
                console.log(window.innerWidth);
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

            drawOnscreenQuads(p, this.props.quadHead, this.props.camera, this.props.hoveredArtist, this.loadingQuads, this.unloadedQuads, this.unloadedPQ);

            loadUnloaded(this.unprocessedResponses, this.unloadedPQ, this.loadingQuads, this.unloadedQuads);

            if (!this.props.uiHover) {
                this.props.updateHoveredArtist(getHoveredArtist(p, this.props.camera, this.props.clickedArtist, this.props.quadHead, this.props.genre));
            }

            if (this.props.clickedArtist && !this.props.clickedArtist.loaded && !this.clickedLoading) {
                this.clickedLoading = true;
                loadArtist(p, this.props.clickedArtist, this.props.quadHead, this.props.nodeLookup).then(() => {this.clickedLoading = false});
            }

            Debug.createTimingEvent("Get Hovered Artist");

            if (!this.props.clickedArtist && !this.props.genre) {
                this.darkenOpacity = 0;
            }

            if (this.props.genre) {
                this.darkenOpacity = darkenScene(p, this.darkenOpacity, this.props.camera);
            }

            Debug.createTimingEvent("Darken Scene for Genre Nodes");

            if (this.props.genre) {
                this.props.genre.drawGenreFence(p);
                drawNodes(p, this.props.camera, this.props.genre.nodes);
            }

            Debug.createTimingEvent("Draw Genre Nodes");

            if (this.props.clickedArtist) {
                this.darkenOpacity = darkenScene(p, this.darkenOpacity, this.props.camera);
            }

            Debug.createTimingEvent("Darken Scene for Related Nodes");

            if (this.props.clickedArtist && this.props.clickedArtist.loaded) {
                drawEdges(p, this.props.camera, this.props.clickedArtist.edges, this.props.clickedArtist, this.props.hoveredArtist);

                Debug.createTimingEvent("Draw Related Edges");
                drawRelatedNodes(p, this.props.camera, this.props.clickedArtist);
                Debug.createTimingEvent("Draw Related Nodes");
            }

            //TODO reimplement
            /*
            if (clickedArtist && Sidebar.openAmount < 1) {
                Sidebar.openSidebar();
            }
             */

            Debug.createTimingEvent("Sidebar");

            if (p.frameCount % 5 === 0) { //TODO adjust this until it feels right, or adjust it dynamically?
                processOne(p, this.props.camera, this.props.quadHead, this.props.nodeLookup, this.loadingQuads, this.unprocessedResponses);
            }

            Debug.createTimingEvent("Quad Processing");

            p.pop();

            Debug.createTimingEvent("Info Box");
            Debug.debugAll(p, this.props.camera, this.props.hoveredArtist, this.unloadedQuads, this.loadingQuads, this.unprocessedResponses);
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

        p.mousePressed = () => {
            if (!this.props.uiHover) {
                MouseEvents.dragging = true;
                MouseEvents.drag = {x: p.mouseX, y: p.mouseY};
                MouseEvents.start = {x: p.mouseX, y: p.mouseY};
            }
        }

        p.mouseDragged = () => {
            if (MouseEvents.dragging) {
                const newDrag = MouseEvents.getVirtualMouseCoordinates(p, this.props.camera);
                const oldDrag = this.props.camera.screen2virtual(MouseEvents.drag);
                this.props.camera.x += (oldDrag.x - newDrag.x);
                this.props.camera.y += (oldDrag.y - newDrag.y);
                MouseEvents.drag = {x: p.mouseX, y: p.mouseY};
            }
        }

        p.mouseReleased = () => {
            if (MouseEvents.dragging) {
                const newDrag = MouseEvents.getVirtualMouseCoordinates(p, this.props.camera);
                const oldDrag = this.props.camera.screen2virtual(MouseEvents.drag);
                this.props.camera.x += (oldDrag.x - newDrag.x);
                this.props.camera.y += (oldDrag.y - newDrag.y);

                if (Utils.dist(MouseEvents.start.x, MouseEvents.start.y, MouseEvents.drag.x, MouseEvents.drag.y) < 5) {
                    const clickedArtist = handlePointClick(this.props.quadHead, this.props.hoveredArtist, this.props.clickedArtist, this.props.nodeLookup, p);
                    if (clickedArtist) {
                        this.props.updateClickedArtist(clickedArtist)
                    } else {
                        this.props.handleEmptyClick();
                    }
                }

                MouseEvents.driftVec = p.createVector(p.winMouseX - p.pwinMouseX, p.winMouseY - p.pwinMouseY);
                MouseEvents.drifting = true;
                MouseEvents.dragging = false;
            }
        }
    }

    componentDidMount() {
        console.log('P5 Component Mount');
        console.log(window.innerWidth);
        this.props.setCanvas(new p5(this.Sketch, this.myRef.current));

        this.clickedLoading = false;
        this.darkenOpacity = 0;

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