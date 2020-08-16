var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ZoomModule = function (_React$Component) {
    _inherits(ZoomModule, _React$Component);

    function ZoomModule(props) {
        _classCallCheck(this, ZoomModule);

        return _possibleConstructorReturn(this, (ZoomModule.__proto__ || Object.getPrototypeOf(ZoomModule)).call(this, props));
    }

    _createClass(ZoomModule, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var colorStyle = void 0;
            var color = this.props.colorant ? this.props.colorant.colorToString() : 'white';

            colorStyle = {
                borderColor: color,
                boxShadow: "0 0 10px 0 " + color + ", inset 0 0 5px 0 " + color
            };

            return React.createElement(
                "div",
                { className: "zoomModuleDiv" },
                React.createElement(
                    "div",
                    { className: "zoomModuleButton",
                        style: colorStyle,
                        onClick: this.props.zoomCameraIn,

                        onMouseEnter: function onMouseEnter() {
                            if (!_this2.props.expanded) {
                                _this2.setState({ hoverState: 1 });
                            }
                            _this2.props.updateHoverFlag(true);
                        },

                        onMouseLeave: function onMouseLeave() {
                            _this2.setState({ hoverState: 0 });
                            _this2.props.updateHoverFlag(false);
                        }
                    },
                    React.createElement(
                        "p",
                        null,
                        "+"
                    )
                ),
                React.createElement(
                    "div",
                    { className: "zoomModuleButton",
                        style: colorStyle,
                        onClick: this.props.resetCamera,

                        onMouseEnter: function onMouseEnter() {
                            if (!_this2.props.expanded) {
                                _this2.setState({ hoverState: 1 });
                            }
                            _this2.props.updateHoverFlag(true);
                        },

                        onMouseLeave: function onMouseLeave() {
                            _this2.setState({ hoverState: 0 });
                            _this2.props.updateHoverFlag(false);
                        }
                    },
                    React.createElement(
                        "p",
                        null,
                        "\u2302"
                    )
                ),
                React.createElement(
                    "div",
                    { className: "zoomModuleButton",
                        style: colorStyle,
                        onClick: this.props.zoomCameraOut,

                        onMouseEnter: function onMouseEnter() {
                            if (!_this2.props.expanded) {
                                _this2.setState({ hoverState: 1 });
                            }
                            _this2.props.updateHoverFlag(true);
                        },

                        onMouseLeave: function onMouseLeave() {
                            _this2.setState({ hoverState: 0 });
                            _this2.props.updateHoverFlag(false);
                        }
                    },
                    React.createElement(
                        "p",
                        null,
                        "-"
                    )
                )
            );
        }
    }]);

    return ZoomModule;
}(React.Component);