var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UndoRedoComponent = function (_React$Component) {
    _inherits(UndoRedoComponent, _React$Component);

    function UndoRedoComponent(props) {
        _classCallCheck(this, UndoRedoComponent);

        return _possibleConstructorReturn(this, (UndoRedoComponent.__proto__ || Object.getPrototypeOf(UndoRedoComponent)).call(this, props));
    }

    _createClass(UndoRedoComponent, [{
        key: "render",
        value: function render() {

            var undoClass = "undoRedoButton " + (this.props.sidebarState && this.props.sidebarState.canUndo() ? "undoRedoClickable" : "undoRedoUnclickable");
            var redoClass = "undoRedoButton " + (this.props.sidebarState && this.props.sidebarState.canRedo() ? "undoRedoClickable" : "undoRedoUnclickable");

            return React.createElement(
                "div",
                { className: "undoRedo" },
                React.createElement(
                    "button",
                    { className: undoClass, onClick: this.props.undoSidebarState },
                    "<"
                ),
                React.createElement(
                    "button",
                    { className: redoClass, onClick: this.props.redoSidebarState },
                    ">"
                )
            );
        }
    }]);

    return UndoRedoComponent;
}(React.Component);