var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this.state = {
            canvas: null,
            p5: null,
            camera: null,

            hoveredArtist: null,
            clickedArtist: null,
            hoverPoint: {},

            activeGenre: null,

            quadHead: null,

            nodeLookup: {},
            nodeOccurrences: {},

            timingEvents: {},
            lastTime: 0,

            uiHover: false,
            clearSearch: false,

            currentSidebarState: null,

            spButtonExpanded: false,
            randomButtonExpanded: false,

            activePath: {
                nodes: [],
                edges: []
            },

            showChangelog: !_this.checkVersion("0.5.3"),
            version: "0.6.0",
            headline: "Shortest Path and More!",
            changes: ["You can now play each artist's music from inside the browser! This can be very loud, be careful.", "Added a temporary favicon while we still figure out how to brand this thing.", "Streamlined a lot of the request pipeline so searching and clicking should feel faster.", "Added a back/forward button on the sidebar for artists, genres, and the shortest path.", "Added many performance improvements in how much data is loaded onto your device.", "Added genre searching. This happens in the same place as artist searching.", "Added a shortest path finder, you can use this by clicking on the arrow button on the left side.", "Added a random node button.", "Added a (to-be stylized) zoom module in the lower right for those who were struggling with the zooming.", "Fixed some bugs with hovering over artists."],
            upcomingFeatures: ["Add previous versions to this changelog!", "Performance improvements", "Personal spotify integration", "Wider trackpad support"]
        };

        _this.setCanvas = _this.setCanvas.bind(_this);
        _this.setCamera = _this.setCamera.bind(_this);

        _this.resetCamera = _this.resetCamera.bind(_this);
        _this.zoomCameraOut = _this.zoomCameraOut.bind(_this);
        _this.zoomCameraIn = _this.zoomCameraIn.bind(_this);

        _this.updateClickedArtist = _this.updateClickedArtist.bind(_this);
        _this.setSidebarState = _this.setSidebarState.bind(_this);
        _this.undoSidebarState = _this.undoSidebarState.bind(_this);
        _this.redoSidebarState = _this.redoSidebarState.bind(_this);

        _this.handleEmptyClick = _this.handleEmptyClick.bind(_this);
        _this.expandSP = _this.expandSP.bind(_this);
        _this.updatePath = _this.updatePath.bind(_this);

        _this.flipClearSearch = _this.flipClearSearch.bind(_this);

        _this.loadArtistFromUI = _this.loadArtistFromUI.bind(_this);
        _this.loadArtistFromSearch = _this.loadArtistFromSearch.bind(_this);
        _this.createNodesFromSuggestions = _this.createNodesFromSuggestions.bind(_this);
        _this.fetchRandomArtist = _this.fetchRandomArtist.bind(_this);

        _this.updateHoveredArtist = _this.updateHoveredArtist.bind(_this);
        _this.updateHoverPoint = _this.updateHoverPoint.bind(_this);

        _this.updateHoverFlag = _this.updateHoverFlag.bind(_this);

        _this.loadGenreFromSearch = _this.loadGenreFromSearch.bind(_this);
        _this.setQuadHead = _this.setQuadHead.bind(_this);

        _this.tryRemoveChangelog = _this.tryRemoveChangelog.bind(_this);
        _this.checkVersion = _this.checkVersion.bind(_this);
        return _this;
    }

    _createClass(App, [{
        key: "checkVersion",
        value: function checkVersion(versionNumber) {
            var clientVersion = localStorage.getItem('mapify-version');
            if (clientVersion !== versionNumber) {
                localStorage.setItem('mapify-version', versionNumber);
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "tryRemoveChangelog",
        value: function tryRemoveChangelog() {
            this.setState({ showChangelog: false });
        }
    }, {
        key: "updateHoverFlag",
        value: function updateHoverFlag(value) {
            if (this.state.uiHover !== value) {
                this.setState({ uiHover: value });
            }
        }

        //<editor-fold desc="Clicked Artist Handling">

    }, {
        key: "updateClickedArtist",
        value: function updateClickedArtist(artist) {
            var _this2 = this;

            if (artist.loaded) {
                this.setSidebarState(artist, this.state.activeGenre, { nodes: [], edges: [] }, { x: artist.x, y: artist.y, zoom: this.state.camera.getZoomFromWidth(artist.size * 50) }, null);
            } else if (artist.id) {
                loadArtist(this.state.p5, artist, this.state.quadHead, this.state.nodeLookup).then(function () {
                    artist = _this2.state.nodeLookup[artist.id];
                    _this2.setSidebarState(artist, _this2.state.activeGenre, { nodes: [], edges: [] }, { x: artist.x, y: artist.y, zoom: _this2.state.camera.getZoomFromWidth(artist.size * 50) }, null);
                });
            }
            this.setState({ hoveredArtist: null });
        }
    }, {
        key: "setSidebarState",
        value: function setSidebarState(artist, genre, path, camera, state) {
            if (artist) {
                artist.edges = makeEdges(artist);
            }

            if (!state && (artist || genre || path.nodes.length > 0)) {
                state = new SidebarState({ artist: artist, genre: genre, path: path, camera: camera }, this.state.currentSidebarState);
            }

            this.setState({
                clickedArtist: artist,
                activeGenre: genre,
                activePath: path,
                currentSidebarState: state
            });
        }
    }, {
        key: "undoSidebarState",
        value: function undoSidebarState() {
            if (this.state.currentSidebarState && this.state.currentSidebarState.canUndo()) {
                var newSidebarState = this.state.currentSidebarState.undo();
                this.setSidebarState(newSidebarState.payload.artist, newSidebarState.payload.genre, newSidebarState.payload.path, newSidebarState.payload.camera, newSidebarState);
                this.state.camera.setCameraMove(newSidebarState.payload.camera.x, newSidebarState.payload.camera.y, newSidebarState.payload.camera.zoom, 45);
            }
        }
    }, {
        key: "redoSidebarState",
        value: function redoSidebarState() {
            if (this.state.currentSidebarState && this.state.currentSidebarState.canRedo()) {
                var newSidebarState = this.state.currentSidebarState.redo();
                this.setSidebarState(newSidebarState.payload.artist, newSidebarState.payload.genre, newSidebarState.payload.path, newSidebarState.payload.camera, newSidebarState);
                this.state.camera.setCameraMove(newSidebarState.payload.camera.x, newSidebarState.payload.camera.y, newSidebarState.payload.camera.zoom, 45);
            }
        }
    }, {
        key: "loadArtistFromUI",
        value: function loadArtistFromUI(artist) {
            this.updateClickedArtist(artist);
            this.state.camera.setCameraMove(artist.x, artist.y, this.state.camera.getZoomFromWidth(artist.size * 50), 45);
        }
    }, {
        key: "loadArtistFromSearch",
        value: function (_loadArtistFromSearch) {
            function loadArtistFromSearch(_x) {
                return _loadArtistFromSearch.apply(this, arguments);
            }

            loadArtistFromSearch.toString = function () {
                return _loadArtistFromSearch.toString();
            };

            return loadArtistFromSearch;
        }(function (searchTerm) {
            var _this3 = this;

            loadArtistFromSearch(this.state.p5, searchTerm, false, this.state.quadHead, this.state.nodeLookup).then(function (artist) {
                if (artist) {
                    _this3.updateClickedArtist(artist);
                    _this3.state.camera.setCameraMove(artist.x, artist.y, _this3.state.camera.getZoomFromWidth(artist.size * 50), 45);
                }
            });
        })
    }, {
        key: "createNodesFromSuggestions",
        value: function createNodesFromSuggestions(data) {
            var newData = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var node = _step.value;

                    newData.push(createNewNode(node, this.state.quadHead, this.state.nodeLookup));
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

            return newData;
        }
        //</editor-fold>

    }, {
        key: "loadGenreFromSearch",
        value: function loadGenreFromSearch(genreName) {
            var _this4 = this;

            fetch("genre/" + genreName).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data.artists || data.artists.length === 0) {
                    return;
                }

                var name = data.name;
                var r = data.r;
                var g = data.g;
                var b = data.b;

                var nodesList = [];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = data.artists[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var node = _step2.value;

                        createNewNode(node, _this4.state.quadHead, _this4.state.nodeLookup);
                        nodesList.push(_this4.state.nodeLookup[node.id]);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                var nodes = new Set(nodesList);

                var newGenre = new Genre(name, nodes, r, g, b, 0.75);
                var bubble = newGenre.bubble;
                var camWidth = Math.min(5000, bubble.radius * 4);

                _this4.state.camera.setCameraMove(bubble.center.x, bubble.center.y, _this4.state.camera.getZoomFromWidth(camWidth), 45);

                _this4.setSidebarState(null, newGenre, { nodes: [], edges: [] }, { x: bubble.center.x, y: bubble.center.y, zoom: _this4.state.camera.getZoomFromWidth(camWidth) }, null);
            });
        }
    }, {
        key: "handleEmptyClick",
        value: function handleEmptyClick() {

            if (this.state.clickedArtist) {
                this.setSidebarState(null, this.state.activeGenre, this.state.activePath, null, null);
            } else if (this.state.activeGenre) {
                this.setSidebarState(null, null, this.state.activePath, null, null);
            } else {
                this.setSidebarState(null, null, { nodes: [], edges: [] }, null, null);
            }

            this.setState({ clearSearch: true, spButtonExpanded: false });
        }
    }, {
        key: "expandSP",
        value: function expandSP() {
            this.setState({ spButtonExpanded: true });
        }
    }, {
        key: "updatePath",
        value: function updatePath(path) {
            var newPath = [];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = path[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var hop = _step3.value;

                    var node = createNewNode(hop, this.state.quadHead, this.state.nodeLookup);
                    node.images = hop.images;
                    node.track = hop.track;
                    newPath.push(node);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            var newPathEdges = [];

            for (var i = 0; i < newPath.length - 1; i++) {
                newPathEdges.push(makeEdge(newPath[i], newPath[i + 1]));
            }

            var fakeGenre = new Genre('sp', new Set(newPath), 0, 0, 0, 1);
            var bubble = fakeGenre.bubble;
            var camWidth = Math.min(5000, bubble.radius * 4);
            this.state.camera.setCameraMove(bubble.center.x, bubble.center.y, this.state.camera.getZoomFromWidth(camWidth), 45);

            this.setSidebarState(null, null, { nodes: newPath, edges: newPathEdges }, { x: bubble.center.x, y: bubble.center.y, zoom: this.state.camera.getZoomFromWidth(camWidth) }, null);
        }
    }, {
        key: "flipClearSearch",
        value: function flipClearSearch() {
            this.setState({ clearSearch: false });
        }
    }, {
        key: "updateHoveredArtist",
        value: function updateHoveredArtist(artist) {
            if (this.state.hoveredArtist !== artist) {
                this.setState({ hoveredArtist: artist });
            }
            if (artist) {
                this.updateHoverPoint(artist);
            }
        }
    }, {
        key: "updateHoverPoint",
        value: function updateHoverPoint(artist) {
            var point = this.state.camera.virtual2screen({ x: artist.x, y: artist.y });
            if (this.state.hoverPoint !== point) {
                this.setState({ hoverPoint: point });
            }
        }
    }, {
        key: "fetchRandomArtist",
        value: function fetchRandomArtist() {
            var _this5 = this;

            fetch("random").then(function (response) {
                return response.json();
            }).then(function (data) {
                loadArtist(_this5.state.p5, data, _this5.state.quadHead, _this5.state.nodeLookup).then(function () {
                    _this5.loadArtistFromUI(_this5.state.nodeLookup[data.id]);
                });
            });
        }
    }, {
        key: "setCanvas",
        value: function setCanvas(p5) {
            this.setState({ p5: p5 });
            this.initializeResizeObserver();
        }
    }, {
        key: "setCamera",
        value: function setCamera(camera) {
            var _this6 = this;

            this.setState({ camera: camera }, function () {
                _this6.state.camera.zoomCamera({ x: 0, y: 0 });
            });
        }
    }, {
        key: "resetCamera",
        value: function resetCamera() {
            this.state.camera.setCameraMove(0, 0, 1, 30);
        }
    }, {
        key: "zoomCameraOut",
        value: function zoomCameraOut() {
            MouseEvents.zooming = true;
            MouseEvents.scrollStep = 0;
            MouseEvents.zoomCoordinates = { x: this.state.camera.x, y: this.state.camera.y };
            MouseEvents.scrollDelta = 1;
        }
    }, {
        key: "zoomCameraIn",
        value: function zoomCameraIn() {
            MouseEvents.zooming = true;
            MouseEvents.scrollStep = 0;
            MouseEvents.zoomCoordinates = { x: this.state.camera.x, y: this.state.camera.y };
            MouseEvents.scrollDelta = -1;
        }
    }, {
        key: "setQuadHead",
        value: function setQuadHead(quadHead) {
            this.setState({ quadHead: quadHead });
        }
    }, {
        key: "initializeResizeObserver",
        value: function initializeResizeObserver() {
            var _this7 = this;

            this.ro = new ResizeObserver(function (entries) {
                if (entries.length !== 1) {
                    console.log("I don't know what this is");
                } else {
                    var cr = entries[0].contentRect;
                    var w = cr.width;
                    var h = cr.height;
                    if (_this7.state.p5) {
                        _this7.state.p5.resizeCanvas(w, h);
                    }
                    if (_this7.state.camera) {
                        _this7.state.camera.zoomCamera({ x: _this7.state.camera.x, y: _this7.state.camera.y });
                    }
                }
            });
            this.ro.observe(document.getElementById("root"));
        }
    }, {
        key: "render",
        value: function render() {
            var changelog = null;
            if (this.state.showChangelog) {
                changelog = React.createElement(Changelog, {
                    version: this.state.version,
                    headline: this.state.headline,
                    changes: this.state.changes,
                    upcoming: this.state.upcomingFeatures,

                    updateHoverFlag: this.updateHoverFlag,
                    tryRemoveChangelog: this.tryRemoveChangelog
                });
            }

            var colorant = this.state.clickedArtist ? this.state.clickedArtist : this.state.activeGenre ? this.state.activeGenre : this.state.activePath.nodes.length > 0 ? this.state.activePath.nodes[0] : null;

            return React.createElement(
                "div",
                { className: "fullScreen" },
                changelog,
                React.createElement(ShortestPathDialog, {
                    colorant: colorant,
                    expanded: this.state.spButtonExpanded,
                    updateHoverFlag: this.updateHoverFlag,
                    clickHandler: this.expandSP,
                    createNodesFromSuggestions: this.createNodesFromSuggestions,
                    updateHoveredArtist: this.updateHoveredArtist,
                    getArtistFromSearch: this.getArtistFromSearch,
                    updatePath: this.updatePath
                }),
                React.createElement(RandomNodeButton, {
                    colorant: colorant,
                    expanded: this.state.randomButtonExpanded,
                    updateHoverFlag: this.updateHoverFlag,
                    clickHandler: this.fetchRandomArtist
                }),
                React.createElement(ReactInfobox, {
                    artist: this.state.hoveredArtist,
                    point: this.state.hoverPoint
                }),
                React.createElement(ReactSidebar, {
                    artist: this.state.clickedArtist,
                    genre: this.state.activeGenre,
                    path: this.state.activePath.nodes,

                    sidebarState: this.state.currentSidebarState,
                    undoSidebarState: this.undoSidebarState,
                    redoSidebarState: this.redoSidebarState,

                    loadArtistFromUI: this.loadArtistFromUI,
                    loadGenreFromSearch: this.loadGenreFromSearch,
                    updateHoveredArtist: this.updateHoveredArtist,
                    updateHoverFlag: this.updateHoverFlag
                }),
                React.createElement(
                    "div",
                    { className: "rightSideDiv" },
                    React.createElement(ReactSearchBox, {
                        colorant: colorant,

                        loadArtistFromUI: this.loadArtistFromUI,
                        loadArtistFromSearch: this.loadArtistFromSearch,
                        loadGenreFromSearch: this.loadGenreFromSearch,

                        flipClearSearch: this.flipClearSearch,
                        clearSearch: this.state.clearSearch,

                        updateHoverFlag: this.updateHoverFlag,
                        updateHoveredArtist: this.updateHoveredArtist,
                        createNodesFromSuggestions: this.createNodesFromSuggestions
                    }),
                    React.createElement("div", { className: "flexSpacer" }),
                    React.createElement(ZoomModule, {
                        colorant: colorant,

                        updateHoverFlag: this.updateHoverFlag,

                        resetCamera: this.resetCamera,
                        zoomCameraOut: this.zoomCameraOut,
                        zoomCameraIn: this.zoomCameraIn
                    })
                ),
                React.createElement(P5Wrapper, {
                    hoveredArtist: this.state.hoveredArtist,
                    clickedArtist: this.state.clickedArtist,
                    path: this.state.activePath,

                    genre: this.state.activeGenre,

                    nodeLookup: this.state.nodeLookup //TODO consider removing this from P5 and do all load handling at the app level.
                    , quadHead: this.state.quadHead,
                    camera: this.state.camera,
                    p5: this.state.p5,

                    setQuadHead: this.setQuadHead,
                    setCanvas: this.setCanvas,
                    setCamera: this.setCamera,

                    uiHover: this.state.uiHover,
                    updateHoverFlag: this.updateHoverFlag,

                    updateClickedArtist: this.updateClickedArtist,
                    handleEmptyClick: this.handleEmptyClick,
                    updateHoveredArtist: this.updateHoveredArtist
                })
            );
        }
    }]);

    return App;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));