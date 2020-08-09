var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ShortestPathDialog = function (_React$Component) {
    _inherits(ShortestPathDialog, _React$Component);

    function ShortestPathDialog(props) {
        _classCallCheck(this, ShortestPathDialog);

        var _this = _possibleConstructorReturn(this, (ShortestPathDialog.__proto__ || Object.getPrototypeOf(ShortestPathDialog)).call(this, props));

        _this.state = {
            expanded: false,
            tooltip: false
        };
        return _this;
    }

    _createClass(ShortestPathDialog, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var colorStyle = {};
            var borderClassName = "";
            var expandClass = this.state.expanded ? "uiButtonOuterExpand" : "";

            if (this.props.colorant) {
                colorStyle = {
                    borderColor: this.props.colorant.colorToString(),
                    boxShadow: "0 0 10px 0 " + this.props.colorant.colorToString() + ", inset 0 0 5px 0 " + this.props.colorant.colorToString()
                };
            } else {
                borderClassName = "searchBox-white";
            }

            return React.createElement(
                "div",
                { className: "uiButtonOuter " + borderClassName + " " + expandClass,
                    style: colorStyle,
                    onMouseEnter: function onMouseEnter() {
                        _this2.setState({ expanded: true });
                    },
                    onMouseLeave: function onMouseLeave() {
                        _this2.setState({ expanded: false });
                    }
                },
                React.createElement(
                    "svg",
                    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32", className: "uiButton" },
                    React.createElement("path", { d: "M16 3.5L3.5 16 16 28.5 28.5 16zm2.25 15.3v-2.32H14.5a.41.41 0 00-.42.41v5a.41.41 0 01-.41.42h-2.92v-8.75a.42.42 0 01.42-.42h6.66a.41.41 0 00.42-.41v-1.92a.42.42 0 01.71-.29l4.29 4.29L19 19.1a.42.42 0 01-.75-.3z",
                        className: "uiButtonPath"
                    })
                ),
                React.createElement(
                    "h4",
                    { className: "uiButtonTitle" },
                    "SHORTEST PATH"
                ),
                React.createElement(
                    "div",
                    { className: "shortestPathForm" },
                    React.createElement(
                        "label",
                        null,
                        "START"
                    ),
                    React.createElement(
                        "div",
                        { className: "shortestPathSearch" },
                        React.createElement("input", { className: "searchInput " + borderClassName,
                            style: colorStyle,
                            type: "text",
                            placeholder: "search for an artist",
                            onInput: this.processInput,
                            onKeyDown: this.sendSubmitIfEnter,
                            value: this.state.value
                        })
                    ),
                    React.createElement(
                        "label",
                        null,
                        "FINISH"
                    ),
                    React.createElement(
                        "div",
                        { className: "shortestPathSearch" },
                        React.createElement("input", { className: "searchInput " + borderClassName,
                            style: colorStyle,
                            type: "text",
                            placeholder: "search for an artist",
                            onInput: this.processInput,
                            onKeyDown: this.sendSubmitIfEnter,
                            value: this.state.value
                        })
                    )
                ),
                React.createElement(
                    "button",
                    null,
                    "Go"
                )
            );
        }
    }]);

    return ShortestPathDialog;
}(React.Component);