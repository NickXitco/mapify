var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var P5Wrapper = function (_React$Component) {
    _inherits(P5Wrapper, _React$Component);

    function P5Wrapper(props) {
        _classCallCheck(this, P5Wrapper);

        var _this = _possibleConstructorReturn(this, (P5Wrapper.__proto__ || Object.getPrototypeOf(P5Wrapper)).call(this, props));

        _this.Sketch = function (p) {
            p.setup = function () {
                var canvas = p.createCanvas(window.innerWidth, window.innerHeight);
                canvas.mouseOver(function () {
                    Sidebar.hoverFlag = false;SearchBox.hoverFlag = false;
                });

                _this.props.canvasUpdate(canvas);

                camera.zoomCamera({ x: 0, y: 0 });

                loadInitialQuads(loadingQuads).then(function (qH) {
                    quadHead = qH;
                    _this.loading = false;
                });

                p.angleMode(p.DEGREES);
                p.rectMode(p.RADIUS);

                if (!VersionHelper.checkVersion()) {
                    VersionHelper.drawChangelog();
                }
            };

            p.draw = function () {
                if (_this.loading) {
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

                    var shiftedHull = GenreHelpers.offsetHull(GenreHelpers.genreHull, GenreHelpers.genrePoint, 20);
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = shiftedHull[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var point = _step.value;

                            p.vertex(point.x, -point.y);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
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

                if (p.frameCount % 5 === 0) {
                    //TODO adjust this until it feels right, or adjust it dynamically?
                    processOne(quadHead);
                }

                createTimingEvent("Quad Processing");

                p.pop();
                InfoBox.drawInfoBox(hoveredArtist);

                createTimingEvent("Info Box");
                Debug.debugAll(camera, timingEvents);
            };

            p.mouseWheel = function (e) {
                if (Sidebar.hoverFlag) {
                    return;
                }
                e.preventDefault();

                var isTouchPad = e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0;

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
            };

            p.mousePressed = function () {
                if (!SearchBox.hoverFlag && !Sidebar.hoverFlag) {
                    MouseEvents.dragging = true;
                    MouseEvents.drag = { x: p.mouseX, y: p.mouseY };
                    MouseEvents.start = { x: p.mouseX, y: p.mouseY };
                }

                if (!SearchBox.hoverFlag) {
                    SearchBox.deleteSuggestions();
                    SearchBox.input.value = "";
                }
            };

            p.mouseDragged = function () {
                if (MouseEvents.dragging) {
                    var newDrag = MouseEvents.getVirtualMouseCoordinates();
                    var oldDrag = camera.screen2virtual(MouseEvents.drag);
                    camera.x += oldDrag.x - newDrag.x;
                    camera.y += oldDrag.y - newDrag.y;
                    MouseEvents.drag = { x: p.mouseX, y: p.mouseY };
                }
            };

            p.mouseReleased = function () {
                if (MouseEvents.dragging) {
                    var newDrag = MouseEvents.getVirtualMouseCoordinates();
                    var oldDrag = camera.screen2virtual(MouseEvents.drag);
                    camera.x += oldDrag.x - newDrag.x;
                    camera.y += oldDrag.y - newDrag.y;

                    if (Utils.dist(MouseEvents.start.x, MouseEvents.start.y, MouseEvents.drag.x, MouseEvents.drag.y) < 5) {
                        handlePointClick(quadHead);
                    }

                    MouseEvents.driftVec = p.createVector(p.winMouseX - p.pwinMouseX, p.winMouseY - p.pwinMouseY);
                    MouseEvents.drifting = true;
                    MouseEvents.dragging = false;
                }
            };
        };

        _this.myRef = React.createRef();
        _this.loading = true;
        return _this;
    }

    _createClass(P5Wrapper, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            p = new p5(this.Sketch, this.myRef.current);
            camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 1, p);
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement("div", { ref: this.myRef });
        }
    }]);

    return P5Wrapper;
}(React.Component);