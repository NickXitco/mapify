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

            quadHead: null,

            nodeLookup: {},
            nodeOccurences: {},

            timingEvents: {},
            lastTime: 0,

            testArtist: null,

            uiHover: false
        };

        _this.canvasUpdate = _this.canvasUpdate.bind(_this);

        _this.updateClickedArtist = _this.updateClickedArtist.bind(_this);
        _this.unsetClickedArtist = _this.unsetClickedArtist.bind(_this);

        _this.updateClickedGenre = _this.updateClickedGenre.bind(_this);
        _this.processSearchSubmit = _this.processSearchSubmit.bind(_this);

        _this.updateHoveredArtist = _this.updateHoveredArtist.bind(_this);

        _this.updateHoverFlag = _this.updateHoverFlag.bind(_this);

        return _this;
    }

    _createClass(App, [{
        key: "updateHoverFlag",
        value: function updateHoverFlag(value) {
            this.setState({ uiHover: value });
        }
    }, {
        key: "updateClickedArtist",
        value: function updateClickedArtist(artist) {
            console.log(artist);
            if (artist.loaded) {
                this.setState({ clickedArtist: artist });
            }
        }
    }, {
        key: "unsetClickedArtist",
        value: function unsetClickedArtist() {
            this.setState({ clickedArtist: null });
        }
    }, {
        key: "updateHoveredArtist",
        value: function updateHoveredArtist(artist) {
            this.setState({ hoveredArtist: artist });
        }
    }, {
        key: "updateClickedGenre",
        value: function updateClickedGenre(genre) {
            console.log(genre);
        }
    }, {
        key: "processSearchSubmit",
        value: function processSearchSubmit(value) {
            console.log(value);
        }
    }, {
        key: "canvasUpdate",
        value: function canvasUpdate(canvas) {
            this.setState({ canvas: canvas,
                clickedArtist: new Artist({ name: "TestArtist", id: "6", followers: 2000, popularity: 5, x: 50, y: 50, size: 20,
                    r: 25, g: 255, b: 50,
                    genres: ["pop"],
                    relatedIDS: [],
                    relatedVertices: [],
                    quad: null,
                    loaded: true
                })
            });
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
            return React.createElement(
                "div",
                { className: "fullScreen" },
                React.createElement(ReactInfobox, { artist: this.state.hoveredArtist }),
                React.createElement(ReactSidebar, { type: "artist",
                    artist: this.state.clickedArtist,
                    updateClickedGenre: this.updateClickedGenre,
                    updateClickedArtist: this.updateClickedArtist
                }),
                React.createElement(ReactSearchBox, {
                    artist: this.state.clickedArtist,
                    updateClickedArtist: this.updateClickedArtist,
                    processSearchSubmit: this.processSearchSubmit,
                    updateHoverFlag: this.updateHoverFlag
                }),
                React.createElement(P5Wrapper, {
                    canvasUpdate: this.canvasUpdate,
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