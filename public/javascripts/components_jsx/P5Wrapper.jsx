class P5Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef()
        this.loading = true;
    }



    Sketch = (p) => {
        p.setup = () => {
            const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
            canvas.mouseOver(() => {Sidebar.hoverFlag = false; SearchBox.hoverFlag = false;})

            this.props.canvasUpdate(canvas);

            camera.zoomCamera({x: 0, y: 0});

            loadInitialQuads(loadingQuads).then((qH) => {
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

            resetTiming();
            createTimingEvent("Drawing Setup");

            MouseEvents.drift(camera);
            MouseEvents.zoom();

            if (SearchBox.point) {
                camera.setCameraMove(SearchBox.point.x, SearchBox.point.y, camera.getZoomFromWidth(SearchBox.point.size * 50), 30);

                clickedArtist = SearchBox.point;
                edgeDrawing = true;
                newEdges = true;
                SearchBox.point = null;
            }

            camera.doCameraMove();

            p.push();
            camera.setView();

            createTimingEvent("Camera Moves");

            drawOnscreenQuads(quadHead, camera);

            loadUnloaded(unloadedQuadsPriorityQueue, loadingQuads, unloadedQuads);
            getHoveredArtist(quadHead);

            if (clickedArtist && !clickedArtist.loaded && !clickedLoading) {
                loadArtist(clickedArtist, quadHead).then();
            }

            createTimingEvent("Get Hovered Artist");

            if (!edgeDrawing && GenreHelpers.genreNodes.size === 0) {
                darkenOpacity = 0;
            }

            if (GenreHelpers.genreNodes.size > 0) {
                darkenOpacity = darkenScene(p, darkenOpacity, camera);
            }

            createTimingEvent("Darken Scene for Genre Nodes");

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

                drawNodes(GenreHelpers.genreNodes);
            }

            createTimingEvent("Draw Genre Nodes");

            if (edgeDrawing) {
                darkenOpacity = darkenScene(p, darkenOpacity, camera);
            }

            createTimingEvent("Darken Scene for Related Nodes");

            if (edgeDrawing && clickedArtist && clickedArtist.loaded) {
                drawEdges(clickedArtist);
                createTimingEvent("Draw Related Edges");
                drawRelatedNodes(clickedArtist);
                createTimingEvent("Draw Related Nodes");
            }

            if (clickedArtist && clickedArtist.loaded && Sidebar.artist !== clickedArtist) {
                Sidebar.setArtistSidebar(clickedArtist, quadHead);
            }

            if (clickedArtist && Sidebar.openAmount < 1) {
                Sidebar.openSidebar();
            }

            createTimingEvent("Sidebar");

            if (p.frameCount % 5 === 0) { //TODO adjust this until it feels right, or adjust it dynamically?
                processOne(quadHead);
            }

            createTimingEvent("Quad Processing");

            p.pop();
            InfoBox.drawInfoBox(hoveredArtist);

            createTimingEvent("Info Box");
            Debug.debugAll(camera, timingEvents);
        };

        p.mouseWheel = (e) => {
            if (Sidebar.hoverFlag) {
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
                MouseEvents.zoomCoordinates = MouseEvents.getVirtualMouseCoordinates();
                if (e.ctrlKey && Math.abs(e.deltaY) < 10) {
                    MouseEvents.scrollDelta = e.deltaY / 10;
                } else {
                    MouseEvents.scrollDelta = e.deltaY / 300;
                }
            }
        }

        p.mousePressed = () => {
            if (!SearchBox.hoverFlag && !Sidebar.hoverFlag) {
                MouseEvents.dragging = true;
                MouseEvents.drag = {x: p.mouseX, y: p.mouseY};
                MouseEvents.start = {x: p.mouseX, y: p.mouseY};
            }

            if (!SearchBox.hoverFlag) {
                SearchBox.deleteSuggestions();
                SearchBox.input.value = "";
            }
        }

        p.mouseDragged = () => {
            if (MouseEvents.dragging) {
                const newDrag = MouseEvents.getVirtualMouseCoordinates();
                const oldDrag = camera.screen2virtual(MouseEvents.drag);
                camera.x += (oldDrag.x - newDrag.x);
                camera.y += (oldDrag.y - newDrag.y);
                MouseEvents.drag = {x: p.mouseX, y: p.mouseY};
            }
        }

        p.mouseReleased = () => {
            if (MouseEvents.dragging) {
                const newDrag = MouseEvents.getVirtualMouseCoordinates();
                const oldDrag = camera.screen2virtual(MouseEvents.drag);
                camera.x += (oldDrag.x - newDrag.x);
                camera.y += (oldDrag.y - newDrag.y);

                if (Utils.dist(MouseEvents.start.x, MouseEvents.start.y, MouseEvents.drag.x, MouseEvents.drag.y) < 5) {
                    handlePointClick(quadHead);
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
    }

    render() {
        return (
            <div ref={this.myRef}>

            </div>
        );
    }
}