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
            loading: true,
            camera: null,

            hoveredArtist: null,
            clickedLoading: false,
            clickedArist: null,

            darkenOpacityT: 0,

            quadHead: null,
            unproccessResponses: [],

            unloadedQuads: new Set(),
            loadingQuads: new Set(),
            unloadedQuadsPriorityQueue: new PriorityQueue(function (a, b) {
                return Utils.dist(_this.state.camera.x, _this.state.camera.y, a.x, a.y) - Utils.dist(_this.state.camera.x, _this.state.camera.y, b.x, b.y);
            }),

            newEdges: true,
            edges: [],

            nodeLookup: {},
            nodeOccurences: {},

            timingEvents: {},
            lastTime: 0
        };

        _this.canvasUpdate = _this.canvasUpdate.bind(_this);

        return _this;
    }

    _createClass(App, [{
        key: "canvasUpdate",
        value: function canvasUpdate(canvas) {
            this.setState({ canvas: canvas });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {}
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {}
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "fullScreen" },
                React.createElement(P5Wrapper, { canvasUpdate: this.canvasUpdate })
            );
        }
    }]);

    return App;
}(React.Component);

/*

So here's the plan as I see it.

We have an App component that holds:
    -Info Box
    -Search Box
    -Sidebar
    -Future UI
    -THE CANVAS :O

    The app holds all (or as many as we can manage) global variables in its state.
 */

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));