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
        key: "render",
        value: function render() {
            var _this4 = this;

            var pictureStyle = {
                boxShadow: "0 0 13px 1px " + this.props.genre.colorToString() + ", inset 0 0 1px 2px " + this.props.genre.colorToString()
            };

            var nameStyle = {
                fontSize: this.state.fontSize
            };

            var picture = null;

            return React.createElement(
                "div",
                { className: "nameAndPicture" },
                React.createElement(
                    "div",
                    { className: "sidebarPicture", style: pictureStyle },
                    picture
                ),
                React.createElement(
                    "div",
                    { className: "name" },
                    React.createElement(
                        "h1",
                        { className: "sidebarArtistName", style: nameStyle,
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