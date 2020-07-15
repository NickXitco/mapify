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
            zoomArtist: null,

            quadHead: null,

            nodeLookup: {},
            nodeOccurences: {},

            timingEvents: {},
            lastTime: 0,

            uiHover: false
        };

        _this.canvasUpdate = _this.canvasUpdate.bind(_this);

        _this.updateClickedArtist = _this.updateClickedArtist.bind(_this);
        _this.unsetClickedArtist = _this.unsetClickedArtist.bind(_this);

        _this.loadArtistFromUI = _this.loadArtistFromUI.bind(_this);
        _this.loadArtistFromSearch = _this.loadArtistFromSearch.bind(_this);

        _this.updateClickedGenre = _this.updateClickedGenre.bind(_this);

        _this.updateHoveredArtist = _this.updateHoveredArtist.bind(_this);

        _this.updateHoverFlag = _this.updateHoverFlag.bind(_this);

        return _this;
    }

    _createClass(App, [{
        key: "updateHoverFlag",
        value: function updateHoverFlag(value) {
            this.setState({ uiHover: value });
        }

        //<editor-fold desc="Clicked Artist Handling">

    }, {
        key: "updateClickedArtist",
        value: function updateClickedArtist(artist) {
            var _this2 = this;

            console.log(artist);
            if (artist.loaded) {
                this.setState({ clickedArtist: artist });
            } else if (artist.id) {
                loadArtist(p, artist, quadHead, nodeLookup).then(function () {
                    artist.edges = [];
                    _this2.setState({ clickedArtist: nodeLookup[artist.id] });
                });
            }
        }
    }, {
        key: "loadArtistFromUI",
        value: function loadArtistFromUI(artist) {
            var _this3 = this;

            if (artist.loaded) {
                this.setState({ clickedArtist: artist });
            } else {
                fetch("artist/" + artist.id + "/true").then(function (response) {
                    return response.json();
                }).then(function (data) {
                    var node = createNewNode(data, quadHead, nodeLookup);
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = data.related[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var r = _step.value;

                            node.relatedVertices.add(createNewNode(r, quadHead, nodeLookup));
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

                    node.loaded = true;
                    _this3.setState({ clickedArtist: node });
                    node.edges = [];
                });
            }
            camera.setCameraMove(artist.x, artist.y, camera.getZoomFromWidth(artist.size * 50), 30);
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
            var _this4 = this;

            loadArtistFromSearch(p, searchTerm, false, quadHead, nodeLookup).then(function (node) {
                console.trace(node);
                if (node) {
                    _this4.setState({ clickedArtist: node });
                    node.edges = [];
                    camera.setCameraMove(node.x, node.y, camera.getZoomFromWidth(node.size * 50), 30);
                }
            });
        })
        //</editor-fold>


    }, {
        key: "unsetClickedArtist",
        value: function unsetClickedArtist() {
            this.setState({ clickedArtist: null });
        }
    }, {
        key: "updateHoveredArtist",
        value: function updateHoveredArtist(artist) {
            if (this.state.hoveredArtist !== artist) {
                this.setState({ hoveredArtist: artist });
            }
        }
    }, {
        key: "updateClickedGenre",
        value: function updateClickedGenre(genre) {
            console.log(genre);
        }
    }, {
        key: "canvasUpdate",
        value: function canvasUpdate(canvas) {
            this.setState({ canvas: canvas });
            this.initializeResizeObserver();
        }
    }, {
        key: "initializeResizeObserver",
        value: function initializeResizeObserver() {
            this.ro = new ResizeObserver(function (entries) {
                if (entries.length !== 1) {
                    console.log("I don't know what this is");
                } else {
                    var cr = entries[0].contentRect;
                    var w = cr.width;
                    var h = cr.height;
                    if (p) {
                        p.resizeCanvas(w, h);
                    }
                    camera.zoomCamera({ x: camera.x, y: camera.y });
                }
            });
            this.ro.observe(document.getElementById("root"));
        }
    }, {
        key: "render",
        value: function render() {
            console.log("Rendering!");
            return React.createElement(
                "div",
                { className: "fullScreen" },
                React.createElement(ReactInfobox, { artist: this.state.hoveredArtist }),
                React.createElement(ReactSidebar, {
                    type: "artist",
                    artist: this.state.clickedArtist,
                    updateClickedGenre: this.updateClickedGenre,
                    updateClickedArtist: this.updateClickedArtist,
                    updateHoverFlag: this.updateHoverFlag
                }),
                React.createElement(ReactSearchBox, {
                    artist: this.state.clickedArtist,
                    loadArtistFromUI: this.loadArtistFromUI,
                    loadArtistFromSearch: this.loadArtistFromSearch,
                    updateHoverFlag: this.updateHoverFlag
                }),
                React.createElement(P5Wrapper, {
                    canvasUpdate: this.canvasUpdate,

                    uiHover: this.state.uiHover,
                    updateHoverFlag: this.updateHoverFlag,

                    updateClickedArtist: this.updateClickedArtist,
                    unsetClickedArtist: this.unsetClickedArtist,
                    updateHoveredArtist: this.updateHoveredArtist
                })
            );
        }
    }]);

    return App;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));