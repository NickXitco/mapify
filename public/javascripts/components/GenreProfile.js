var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GenreProfile = function (_React$Component) {
    _inherits(GenreProfile, _React$Component);

    function GenreProfile(props) {
        _classCallCheck(this, GenreProfile);

        var _this = _possibleConstructorReturn(this, (GenreProfile.__proto__ || Object.getPrototypeOf(GenreProfile)).call(this, props));

        _this.state = {
            fontSize: 60,
            genre: null,
            fontSizeUpdating: false
        };

        return _this;
    }

    _createClass(GenreProfile, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            if (this.props.genre !== this.state.genre) {
                this.setState({ fontSize: 60, genre: this.props.genre }, function () {
                    _this2.decrementFontSize();
                });
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            var _this3 = this;

            if (this.props.genre !== this.state.genre) {
                this.setState({ fontSize: 60, genre: this.props.genre }, function () {
                    _this3.decrementFontSize();
                });
            }

            if (this.fontSizeUpdating) {
                this.decrementFontSize();
            }
        }
    }, {
        key: "decrementFontSize",
        value: function decrementFontSize() {
            var height = this.nameElement.clientHeight;
            var width = this.nameElement.clientWidth;

            if (height > 113 || width > 265) {
                this.setState(function (prevState, props) {
                    return {
                        fontSize: prevState.fontSize - props.fontDecrement
                    };
                });
                this.fontSizeUpdating = true;
            } else {
                this.fontSizeUpdating = false;
            }
        }
    }, {
        key: "shapeBoundingBox",
        value: function shapeBoundingBox(points) {
            var n = -Infinity;
            var e = -Infinity;
            var s = Infinity;
            var w = Infinity;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = points[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var p = _step.value;

                    n = Math.max(p.y, n);
                    e = Math.max(p.x, e);
                    s = Math.min(p.y, s);
                    w = Math.min(p.x, w);
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

            var height = Math.abs(n - s);
            var width = Math.abs(e - w);

            if (height > width) {
                e += (height - width) / 2;
                w -= (height - width) / 2;
            } else if (width > height) {
                n += (width - height) / 2;
                s -= (width - height) / 2;
            }

            return {
                n: n,
                e: e,
                s: s,
                w: w
            };
        }
    }, {
        key: "render",
        value: function render() {
            var _this4 = this;

            var nameStyle = {
                fontSize: this.state.fontSize
            };

            var bBox = this.shapeBoundingBox(this.props.genre.hull);

            var polygonString = "";
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.props.genre.hull[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var p = _step2.value;

                    polygonString += Utils.map(p.x, bBox.w, bBox.e, 10, 103) + " ";
                    polygonString += Utils.map(p.y, bBox.s, bBox.n, 103, 10) + " ";
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

            return React.createElement(
                "div",
                { className: "nameAndPictureLarge" },
                React.createElement(
                    "div",
                    { className: "genrePictureLarge" },
                    React.createElement(
                        "svg",
                        { width: "113", height: "113" },
                        React.createElement(
                            "defs",
                            null,
                            React.createElement(
                                "filter",
                                { id: "sofGlow", height: "300%", width: "300%", x: "-75%", y: "-75%" },
                                React.createElement("feMorphology", { operator: "dilate", radius: "1", "in": "SourceAlpha", result: "thicken" }),
                                React.createElement("feGaussianBlur", { "in": "thicken", stdDeviation: "10", result: "blurred" }),
                                React.createElement("feFlood", { floodColor: this.props.genre.colorToString(), result: "glowColor" }),
                                React.createElement("feComposite", { "in": "glowColor", in2: "blurred", operator: "in", result: "softGlow_colored" }),
                                React.createElement(
                                    "feMerge",
                                    null,
                                    React.createElement("feMergeNode", { "in": "softGlow_colored" }),
                                    React.createElement("feMergeNode", { "in": "SourceGraphic" })
                                )
                            )
                        ),
                        React.createElement("polygon", { points: polygonString, stroke: this.props.genre.colorToString(), fill: "transparent", filter: "url(#sofGlow)", strokeWidth: "2" })
                    )
                ),
                React.createElement(
                    "div",
                    { className: "nameLarge" },
                    React.createElement(
                        "h1",
                        { className: "sidebarArtistNameLarge", style: nameStyle,
                            ref: function ref(nameElement) {
                                _this4.nameElement = nameElement;
                            } },
                        this.props.genre.name
                    )
                )
            );
        }
    }]);

    return GenreProfile;
}(React.Component);