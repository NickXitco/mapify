var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactInfobox = function (_React$Component) {
    _inherits(ReactInfobox, _React$Component);

    function ReactInfobox(props) {
        _classCallCheck(this, ReactInfobox);

        var _this = _possibleConstructorReturn(this, (ReactInfobox.__proto__ || Object.getPrototypeOf(ReactInfobox)).call(this, props));

        _this.state = {
            height: 0,
            width: 0
        };
        return _this;
    }

    _createClass(ReactInfobox, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            if (!this.props.artist) {
                return;
            }

            var height = this.nameElement.clientHeight + this.genreElement.clientHeight;
            var width = Math.max(this.nameElement.clientWidth, this.genreElement.clientWidth);

            if (height !== this.state.height || width !== this.state.width) {
                this.setState({ height: height, width: width });
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            if (!this.props.artist) {
                return null;
            }

            var infoBoxDynamicStyles = {
                height: this.state.height,
                width: this.state.width,
                borderColor: this.props.artist.colorToString(),
                boxShadow: "0 0 3px 1px " + this.props.artist.colorToString()

                /*
                top: this.props.point.y + "px"
                left: (this.props.point.x >= window.innerWidth / 2)
                    ? (this.props.point.x - this.state.width - 6) + "px"
                    : (this.props.point.x) + "px"
                 */


                //const dir = this.props.point.x >= window.innerWidth / 2 ? "Right" : "Left";
            };var dir = "Left";

            return React.createElement(
                "div",
                { className: "infoBox infoBox" + dir, style: infoBoxDynamicStyles },
                React.createElement(
                    "p",
                    { className: "infoBoxText infoBoxArtistName infoBoxArtistName" + dir,
                        ref: function ref(nameElement) {
                            _this2.nameElement = nameElement;
                        } },
                    this.props.artist.name
                ),
                React.createElement(
                    "p",
                    { className: "infoBoxText infoBoxArtistGenre infoBoxArtistGenre" + dir,
                        ref: function ref(genreElement) {
                            _this2.genreElement = genreElement;
                        } },
                    this.props.artist.genres.length > 0 ? this.props.artist.genres[0] : ""
                )
            );
        }
    }]);

    return ReactInfobox;
}(React.Component);