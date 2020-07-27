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
                console.log('P5 Setup');
                console.log(window.innerWidth);
                var canvas = p.createCanvas(window.innerWidth, window.innerHeight);
                canvas.mouseOver(function () {
                    _this.props.updateHoverFlag(false);
                });

                var camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 1, _this.props.p5);
                _this.props.setCamera(camera);
                _this.unloadedPQ = new PriorityQueue(function (a, b) {
                    return Utils.dist(camera.x, camera.y, a.x, a.y) - Utils.dist(camera.x, camera.y, b.x, b.y);
                });

                loadInitialQuads(_this.loadingQuads, _this.unprocessedResponses).then(function (qH) {
                    _this.props.setQuadHead(qH);
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
                    console.log('P5 Draw');
                    console.log(window.innerWidth);
                    drawLoading();
                    return;
                }

                p.background(3);

                Debug.resetTiming();
                Debug.createTimingEvent("Drawing Setup");

                MouseEvents.drift(_this.props.camera, p);
                MouseEvents.zoom(_this.props.camera);

                _this.props.camera.doCameraMove();

                p.push();
                _this.props.camera.setView();

                Debug.createTimingEvent("Camera Moves");

                drawOnscreenQuads(p, _this.props.quadHead, _this.props.camera, _this.props.hoveredArtist, _this.loadingQuads, _this.unloadedQuads, _this.unloadedPQ);

                loadUnloaded(_this.unprocessedResponses, _this.unloadedPQ, _this.loadingQuads, _this.unloadedQuads);

                if (!_this.props.uiHover) {
                    _this.props.updateHoveredArtist(getHoveredArtist(p, _this.props.camera, _this.props.clickedArtist, _this.props.quadHead, _this.props.genre));
                }

                if (_this.props.clickedArtist && !_this.props.clickedArtist.loaded && !_this.clickedLoading) {
                    _this.clickedLoading = true;
                    loadArtist(p, _this.props.clickedArtist, _this.props.quadHead, _this.props.nodeLookup).then(function () {
                        _this.clickedLoading = false;
                    });
                }

                Debug.createTimingEvent("Get Hovered Artist");

                if (!_this.props.clickedArtist && !_this.props.genre) {
                    _this.darkenOpacity = 0;
                }

                if (_this.props.genre) {
                    _this.darkenOpacity = darkenScene(p, _this.darkenOpacity, _this.props.camera);
                }

                Debug.createTimingEvent("Darken Scene for Genre Nodes");

                if (_this.props.genre) {
                    _this.props.genre.drawGenreFence(p);
                    drawNodes(p, _this.props.camera, _this.props.genre.nodes);
                }

                Debug.createTimingEvent("Draw Genre Nodes");

                if (_this.props.clickedArtist) {
                    _this.darkenOpacity = darkenScene(p, _this.darkenOpacity, _this.props.camera);
                }

                Debug.createTimingEvent("Darken Scene for Related Nodes");

                if (_this.props.clickedArtist && _this.props.clickedArtist.loaded) {
                    drawEdges(p, _this.props.camera, _this.props.clickedArtist.edges, _this.props.clickedArtist, _this.props.hoveredArtist);

                    Debug.createTimingEvent("Draw Related Edges");
                    drawRelatedNodes(p, _this.props.camera, _this.props.clickedArtist);
                    Debug.createTimingEvent("Draw Related Nodes");
                }

                //TODO reimplement
                /*
                if (clickedArtist && Sidebar.openAmount < 1) {
                    Sidebar.openSidebar();
                }
                 */

                Debug.createTimingEvent("Sidebar");

                if (p.frameCount % 5 === 0) {
                    //TODO adjust this until it feels right, or adjust it dynamically?
                    processOne(p, _this.props.camera, _this.props.quadHead, _this.props.nodeLookup, _this.loadingQuads, _this.unprocessedResponses);
                }

                Debug.createTimingEvent("Quad Processing");

                p.pop();

                Debug.createTimingEvent("Info Box");
                Debug.debugAll(p, _this.props.camera, _this.props.hoveredArtist, _this.unloadedQuads, _this.loadingQuads, _this.unprocessedResponses);
            };

            p.mouseWheel = function (e) {
                if (_this.props.uiHover) {
                    return;
                }
                e.preventDefault();

                var isTouchPad = e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0;

                if (isTouchPad && !e.ctrlKey) {
                    _this.props.camera.x -= e.deltaX * (1 / _this.props.camera.getZoomFactor().x);
                    _this.props.camera.y += e.deltaY * (1 / _this.props.camera.getZoomFactor().y);
                } else {
                    MouseEvents.zooming = true;
                    MouseEvents.scrollStep = 0;
                    MouseEvents.zoomCoordinates = MouseEvents.getVirtualMouseCoordinates(p, _this.props.camera);
                    if (e.ctrlKey && Math.abs(e.deltaY) < 10) {
                        MouseEvents.scrollDelta = e.deltaY / 10;
                    } else {
                        MouseEvents.scrollDelta = e.deltaY / 300;
                    }
                }
            };

            p.mousePressed = function () {
                if (!_this.props.uiHover) {
                    MouseEvents.dragging = true;
                    MouseEvents.drag = { x: p.mouseX, y: p.mouseY };
                    MouseEvents.start = { x: p.mouseX, y: p.mouseY };
                }
            };

            p.mouseDragged = function () {
                if (MouseEvents.dragging) {
                    var newDrag = MouseEvents.getVirtualMouseCoordinates(p, _this.props.camera);
                    var oldDrag = _this.props.camera.screen2virtual(MouseEvents.drag);
                    _this.props.camera.x += oldDrag.x - newDrag.x;
                    _this.props.camera.y += oldDrag.y - newDrag.y;
                    MouseEvents.drag = { x: p.mouseX, y: p.mouseY };
                }
            };

            p.mouseReleased = function () {
                if (MouseEvents.dragging) {
                    var newDrag = MouseEvents.getVirtualMouseCoordinates(p, _this.props.camera);
                    var oldDrag = _this.props.camera.screen2virtual(MouseEvents.drag);
                    _this.props.camera.x += oldDrag.x - newDrag.x;
                    _this.props.camera.y += oldDrag.y - newDrag.y;

                    if (Utils.dist(MouseEvents.start.x, MouseEvents.start.y, MouseEvents.drag.x, MouseEvents.drag.y) < 5) {
                        var clickedArtist = handlePointClick(_this.props.quadHead, _this.props.hoveredArtist, _this.props.clickedArtist, _this.props.nodeLookup, p);
                        if (clickedArtist) {
                            _this.props.updateClickedArtist(clickedArtist);
                        } else {
                            _this.props.handleEmptyClick();
                        }
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
        key: 'componentDidMount',
        value: function componentDidMount() {
            console.log('P5 Component Mount');
            console.log(window.innerWidth);
            this.props.setCanvas(new p5(this.Sketch, this.myRef.current));

            this.clickedLoading = false;
            this.darkenOpacity = 0;

            this.unprocessedResponses = [];
            this.unloadedQuads = new Set();
            this.loadingQuads = new Set();
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement('div', { ref: this.myRef });
        }
    }]);

    return P5Wrapper;
}(React.Component);