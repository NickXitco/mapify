var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var P5Wrapper = function (_React$Component) {
    _inherits(P5Wrapper, _React$Component);

    function P5Wrapper(props) {
        _classCallCheck(this, P5Wrapper);

        var _this = _possibleConstructorReturn(this, (P5Wrapper.__proto__ || Object.getPrototypeOf(P5Wrapper)).call(this, props));

        _this.Sketch = function (p) {
            var x = 100;
            var y = 100;

            p.setup = function () {
                p.createCanvas(200, 200);
            };

            p.draw = function () {
                p.background(0);
                p.fill(255);
                p.rect(x, y, 50, 50);
            };
        };

        _this.myRef = React.createRef();
        return _this;
    }

    _createClass(P5Wrapper, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.myP5 = new p5(this.Sketch, this.myRef.current);
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement("div", { ref: this.myRef });
        }
    }]);

    return P5Wrapper;
}(React.Component);