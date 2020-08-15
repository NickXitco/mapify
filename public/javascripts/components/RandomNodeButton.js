var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RandomNodeButton = function (_React$Component) {
    _inherits(RandomNodeButton, _React$Component);

    function RandomNodeButton(props) {
        _classCallCheck(this, RandomNodeButton);

        var _this = _possibleConstructorReturn(this, (RandomNodeButton.__proto__ || Object.getPrototypeOf(RandomNodeButton)).call(this, props));

        _this.state = {
            tooltip: false,
            hoverState: 0,

            fullyExpanded: false
        };

        _this.expandFully = _this.expandFully.bind(_this);
        return _this;
    }

    _createClass(RandomNodeButton, [{
        key: "expandFully",
        value: function expandFully() {
            if (!this.state.fullyExpanded && this.props.expanded) {
                this.setState({ fullyExpanded: true });
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var colorStyle = {};
            var borderClassName = "";
            var expandClass = this.props.expanded ? "uiButtonOuterExpand" : this.state.hoverState === 1 ? "uiButtonOuterHover" : "";
            var fullyExpanded = this.state.fullyExpanded && this.props.expanded ? "uiButtonOuterExpanded" : "";

            if (this.state.fullyExpanded && !this.props.expanded) {
                this.setState({ fullyExpanded: false });
            }

            var color = this.props.colorant ? this.props.colorant.colorToString() : 'white';

            switch (this.state.hoverState) {
                case 0:
                    colorStyle = {
                        borderColor: color,
                        boxShadow: "0 0 10px 0 " + color + ", inset 0 0 5px 0 " + color
                    };
                    break;
                case 1:
                    colorStyle = {
                        borderColor: color,
                        boxShadow: "0 0 15px 0 " + color + ", inset 0 0 10px 0 " + color
                    };
                    break;
            }

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "randomButtonOuter uiButtonOuter " + borderClassName + " " + expandClass + " " + fullyExpanded,
                        style: colorStyle,

                        onMouseEnter: function onMouseEnter() {
                            if (!_this2.props.expanded) {
                                _this2.setState({ hoverState: 1 });
                            }
                            _this2.props.updateHoverFlag(true);
                        },

                        onMouseLeave: function onMouseLeave() {
                            _this2.setState({ hoverState: 0 });
                            _this2.props.updateHoverFlag(false);
                        },

                        onClick: function onClick() {
                            _this2.props.clickHandler();
                            setTimeout(_this2.expandFully, 400);
                            _this2.setState({ hoverState: 0 });
                        }
                    },
                    React.createElement(
                        "svg",
                        { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32", className: "uiButton" },
                        React.createElement(
                            "defs",
                            null,
                            React.createElement(
                                "clipPath",
                                { id: "clip-path" },
                                React.createElement("path", { className: "cls-1", d: "M16.49 25.19l-10.42.31L3.62 9.77l10.42-.3 2.45 15.72z" })
                            ),
                            React.createElement(
                                "clipPath",
                                { id: "clip-path-2" },
                                React.createElement("path", { className: "cls-1", d: "M14.04 9.47l-10.42.3 11.89-2.96 10.42-.31-11.89 2.97z" })
                            ),
                            React.createElement(
                                "clipPath",
                                { id: "clip-path-3" },
                                React.createElement("path", { className: "cls-1", d: "M25.93 6.5l2.45 15.73-11.89 2.96-2.45-15.72L25.93 6.5z" })
                            )
                        ),
                        React.createElement(
                            "g",
                            { clipPath: "url(#clip-path)" },
                            React.createElement("path", { className: "cls-4 uiButtonPath",
                                d: "M13.77 20.34c.16 1.08-.28 2-1 2s-1.44-.85-1.61-1.93.28-2 1-2 1.44.85 1.61 1.94m-.92-5.9c.17 1.09-.28 2-1 2s-1.43-.84-1.6-1.92.27-2 1-2 1.44.83 1.61 1.92m-3 6c.17 1.08-.28 2-1 2s-1.44-.84-1.61-1.92.28-2 1-2 1.44.84 1.61 1.93M9 14.55c.17 1.09-.28 2-1 2s-1.43-.83-1.6-1.92.28-2 1-2 1.45.84 1.62 1.92m-5.4-4.78l2.45 15.72 10.42-.3L14 9.47l-10.42.3" })
                        ),
                        React.createElement(
                            "g",
                            { clipPath: "url(#clip-path-2)" },
                            React.createElement("path", { className: "cls-4 uiButtonPath",
                                d: "M15.71 8.77a17.26 17.26 0 01-2.79.41c-.72 0-.64-.13.19-.34a17.15 17.15 0 012.78-.41c.72 0 .64.13-.18.34m5.95-1.49a15.42 15.42 0 01-2.79.41c-.72 0-.64-.12.18-.33A15.42 15.42 0 0121.84 7c.72 0 .64.13-.18.33m-5.58.82a15.3 15.3 0 01-2.79.41c-.72 0-.64-.13.19-.33a15.17 15.17 0 012.79-.41c.71 0 .63.13-.19.33m-5.58.82a16.22 16.22 0 01-2.79.41C7 9.35 7.07 9.2 7.9 9a16.05 16.05 0 012.78-.4c.72 0 .64.12-.18.33m5.95-1.48a16.3 16.3 0 01-2.79.4c-.72 0-.64-.12.18-.33a16.36 16.36 0 012.79-.41c.72 0 .64.13-.18.34m-.93-.63l-11.9 3 10.43-.3 11.89-3-10.42.31" })
                        ),
                        React.createElement(
                            "g",
                            { clipPath: "url(#clip-path-3)" },
                            React.createElement("path", { className: "cls-4 uiButtonPath",
                                d: "M21.52 17.81c-.82.21-1.63-.51-1.8-1.59a2 2 0 011.19-2.34c.81-.2 1.62.51 1.79 1.6a2 2 0 01-1.18 2.33m4.42-11.3L14 9.47l2.45 15.72 11.89-3-2.4-15.68" })
                        )
                    ),
                    React.createElement(
                        "h4",
                        { className: "uiButtonTitle" },
                        "RANDOM ARTIST"
                    )
                )
            );
        }
    }]);

    return RandomNodeButton;
}(React.Component);