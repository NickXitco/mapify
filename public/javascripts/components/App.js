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

            uiHover: false
        };

        _this.setCanvas = _this.setCanvas.bind(_this);
        _this.setCamera = _this.setCamera.bind(_this);

        _this.updateClickedArtist = _this.updateClickedArtist.bind(_this);
        _this.handleEmptyClick = _this.handleEmptyClick.bind(_this);

        _this.loadArtistFromUI = _this.loadArtistFromUI.bind(_this);
        _this.loadArtistFromSearch = _this.loadArtistFromSearch.bind(_this);

        _this.updateHoveredArtist = _this.updateHoveredArtist.bind(_this);
        _this.updateHoverPoint = _this.updateHoverPoint.bind(_this);

        _this.updateHoverFlag = _this.updateHoverFlag.bind(_this);

        _this.loadGenreFromSearch = _this.loadGenreFromSearch.bind(_this);
        _this.setQuadHead = _this.setQuadHead.bind(_this);
        return _this;
    }

    _createClass(App, [{
        key: 'updateHoverFlag',
        value: function updateHoverFlag(value) {
            if (this.state.uiHover !== value) {
                this.setState({ uiHover: value });
            }
        }

        //<editor-fold desc="Clicked Artist Handling">

    }, {
        key: 'updateClickedArtist',
        value: function updateClickedArtist(artist) {
            var _this2 = this;

            if (artist.loaded) {
                artist.edges = makeEdges(artist);
                this.setState({ clickedArtist: artist });
            } else if (artist.id) {
                loadArtist(this.state.p5, artist, this.state.quadHead, this.state.nodeLookup).then(function () {
                    artist = _this2.state.nodeLookup[artist.id];
                    artist.edges = makeEdges(artist);
                    _this2.setState({ clickedArtist: artist });
                });
            }
        }
    }, {
        key: 'loadArtistFromUI',
        value: function loadArtistFromUI(artist) {
            this.updateClickedArtist(artist);
            this.state.camera.setCameraMove(artist.x, artist.y, this.state.camera.getZoomFromWidth(artist.size * 50), 30);
        }
    }, {
        key: 'loadArtistFromSearch',
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
                console.trace(artist);
                if (artist) {
                    _this3.updateClickedArtist(artist);
                    _this3.state.camera.setCameraMove(artist.x, artist.y, _this3.state.camera.getZoomFromWidth(artist.size * 50), 30);
                }
            });
        })
        //</editor-fold>

    }, {
        key: 'loadGenreFromSearch',
        value: function loadGenreFromSearch(genreName) {
            var _this4 = this;

            fetch('genre/' + genreName).then(function (response) {
                return response.json();
            }).then(function (data) {
                console.log(data);
                if (!data.artists || data.artists.length === 0) {
                    return;
                }

                var name = data.name;
                var r = data.r;
                var g = data.g;
                var b = data.b;

                var nodesList = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = data.artists[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var node = _step.value;

                        createNewNode(node, _this4.state.quadHead, _this4.state.nodeLookup);
                        nodesList.push(_this4.state.nodeLookup[node.id]);
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

                var nodes = new Set(nodesList);

                var newGenre = new Genre(name, nodes, r, g, b);
                var bubble = newGenre.bubble;
                var camWidth = Math.min(7500, bubble.radius * 4);

                _this4.state.camera.setCameraMove(bubble.center.x, bubble.center.y, _this4.state.camera.getZoomFromWidth(camWidth), 30);

                _this4.setState({ clickedArtist: null, activeGenre: newGenre });
            });
        }

        /**
         *                 artist
         *                0     |     1
         *          |-------------------------
         *        0 | both null | both null
         * genre    |--------------------------
         *        1 | both null | artist null,
         *          |           | genre unchanged
         *
         */

    }, {
        key: 'handleEmptyClick',
        value: function handleEmptyClick() {
            if (!(this.state.activeGenre && this.state.clickedArtist)) {
                this.setState({ activeGenre: null });
            }
            this.setState({ clickedArtist: null });
        }
    }, {
        key: 'updateHoveredArtist',
        value: function updateHoveredArtist(artist) {
            if (this.state.hoveredArtist !== artist) {
                this.setState({ hoveredArtist: artist });
            }
            if (artist) {
                this.updateHoverPoint(artist);
            }
        }
    }, {
        key: 'updateHoverPoint',
        value: function updateHoverPoint(artist) {
            var point = this.state.camera.virtual2screen({ x: artist.x, y: artist.y });
            if (this.state.hoverPoint !== point) {
                this.setState({ hoverPoint: point });
            }
        }
    }, {
        key: 'setCanvas',
        value: function setCanvas(p5) {
            this.setState({ p5: p5 }, function () {
                console.log('P5 Set state callback');
                console.log(window.innerWidth);
            });
            this.initializeResizeObserver();
        }
    }, {
        key: 'setCamera',
        value: function setCamera(camera) {
            var _this5 = this;

            this.setState({ camera: camera }, function () {
                console.log('Camera Set state callback');
                console.log(window.innerWidth);
                _this5.state.camera.zoomCamera({ x: 0, y: 0 });
            });
        }
    }, {
        key: 'setQuadHead',
        value: function setQuadHead(quadHead) {
            this.setState({ quadHead: quadHead });
        }
    }, {
        key: 'initializeResizeObserver',
        value: function initializeResizeObserver() {
            var _this6 = this;

            this.ro = new ResizeObserver(function (entries) {
                if (entries.length !== 1) {
                    console.log("I don't know what this is");
                } else {
                    var cr = entries[0].contentRect;
                    var w = cr.width;
                    var h = cr.height;
                    if (_this6.state.p5) {
                        _this6.state.p5.resizeCanvas(w, h);
                    }
                    if (_this6.state.camera) {
                        _this6.state.camera.zoomCamera({ x: _this6.state.camera.x, y: _this6.state.camera.y });
                    }
                }
            });
            this.ro.observe(document.getElementById("root"));
        }
    }, {
        key: 'render',
        value: function render() {
            console.log("Rendering!");
            return React.createElement(
                'div',
                { className: "fullScreen" },
                React.createElement(ReactInfobox, {
                    artist: this.state.hoveredArtist,
                    point: this.state.hoverPoint
                }),
                React.createElement(ReactSidebar, {
                    artist: this.state.clickedArtist,
                    genre: this.state.activeGenre,

                    loadArtistFromUI: this.loadArtistFromUI,
                    loadGenreFromSearch: this.loadGenreFromSearch,
                    updateHoveredArtist: this.updateHoveredArtist,

                    updateHoverFlag: this.updateHoverFlag
                }),
                React.createElement(ReactSearchBox, {
                    artist: this.state.clickedArtist,
                    loadArtistFromUI: this.loadArtistFromUI,
                    loadArtistFromSearch: this.loadArtistFromSearch,
                    updateHoverFlag: this.updateHoverFlag
                }),
                React.createElement(P5Wrapper, {
                    hoveredArtist: this.state.hoveredArtist,
                    clickedArtist: this.state.clickedArtist,

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