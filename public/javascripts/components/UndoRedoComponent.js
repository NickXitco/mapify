var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UndoRedoComponent = function (_React$Component) {
    _inherits(UndoRedoComponent, _React$Component);

    function UndoRedoComponent(props) {
        _classCallCheck(this, UndoRedoComponent);

        var _this = _possibleConstructorReturn(this, (UndoRedoComponent.__proto__ || Object.getPrototypeOf(UndoRedoComponent)).call(this, props));

        _this.state = {
            undoState: 0,
            redoState: 0
        };

        _this.lastState = null;
        return _this;
    }

    _createClass(UndoRedoComponent, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var undoClass = "undoRedoButton " + (this.props.sidebarState && this.props.sidebarState.canUndo() ? "undoRedoClickable" : "undoRedoUnclickable");
            var redoClass = "undoRedoButton " + (this.props.sidebarState && this.props.sidebarState.canRedo() ? "undoRedoClickable" : "undoRedoUnclickable");

            var color = ColorUtilities.rgbToString(this.props.color[0], this.props.color[1], this.props.color[2]);
            var darkerColor = ColorUtilities.rgbToString(this.props.color[0] / 2, this.props.color[1] / 2, this.props.color[2] / 2);

            var hoverStyle = {
                boxShadow: "0 0 20px 0 " + color
            };

            var activeStyle = {
                boxShadow: "0 0 20px 0 " + color + ", inset 0 0 20px 0 " + darkerColor
            };

            var defaultStyle = {
                boxShadow: "0 0 10px 0 " + color
            };

            var undoStyle = void 0;
            var redoStyle = void 0;

            switch (this.state.undoState) {
                case 0:
                    undoStyle = this.props.sidebarState && this.props.sidebarState.canUndo() ? defaultStyle : {};
                    break;
                case 1:
                    undoStyle = this.props.sidebarState && this.props.sidebarState.canUndo() ? hoverStyle : {};
                    break;
                case 2:
                    undoStyle = this.props.sidebarState && this.props.sidebarState.canUndo() ? activeStyle : {};
            }

            switch (this.state.redoState) {
                case 0:
                    redoStyle = this.props.sidebarState && this.props.sidebarState.canRedo() ? defaultStyle : {};
                    break;
                case 1:
                    redoStyle = this.props.sidebarState && this.props.sidebarState.canRedo() ? hoverStyle : {};
                    break;
                case 2:
                    redoStyle = this.props.sidebarState && this.props.sidebarState.canRedo() ? activeStyle : {};
                    break;
            }

            if (this.lastState !== this.props.sidebarState) {
                this.lastState = this.props.sidebarState;
            }

            return React.createElement(
                "div",
                { className: "undoRedo" },
                React.createElement(
                    "button",
                    { className: undoClass,
                        style: undoStyle,
                        onMouseEnter: function onMouseEnter() {
                            _this2.setState({ undoState: 1 });
                        },
                        onMouseLeave: function onMouseLeave() {
                            _this2.setState({ undoState: 0 });
                        },
                        onMouseDown: function onMouseDown() {
                            _this2.setState({ undoState: 2 });
                        },
                        onMouseUp: function onMouseUp() {
                            _this2.setState({ undoState: 1 });
                        },
                        onClick: this.props.undoSidebarState
                    },
                    "<"
                ),
                React.createElement(
                    "button",
                    { className: redoClass,
                        style: redoStyle,
                        onMouseEnter: function onMouseEnter() {
                            _this2.setState({ redoState: 1 });
                        },
                        onMouseLeave: function onMouseLeave() {
                            _this2.setState({ redoState: 0 });
                        },
                        onMouseDown: function onMouseDown() {
                            _this2.setState({ redoState: 2 });
                        },
                        onMouseUp: function onMouseUp() {
                            _this2.setState({ redoState: 1 });
                        },
                        onClick: this.props.redoSidebarState
                    },
                    ">"
                )
            );
        }
    }]);

    return UndoRedoComponent;
}(React.Component);