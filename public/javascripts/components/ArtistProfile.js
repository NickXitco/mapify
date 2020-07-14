var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ArtistProfile = function (_React$Component) {
    _inherits(ArtistProfile, _React$Component);

    function ArtistProfile(props) {
        _classCallCheck(this, ArtistProfile);

        var _this = _possibleConstructorReturn(this, (ArtistProfile.__proto__ || Object.getPrototypeOf(ArtistProfile)).call(this, props));

        _this.state = {
            fontSize: 60,
            artist: null,
            fontSizeUpdating: false
        };

        return _this;
    }

    _createClass(ArtistProfile, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            if (this.props.artist !== this.state.artist) {
                this.setState({ fontSize: 60, artist: this.props.artist }, function () {
                    _this2.decrementFontSize();
                });
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            var _this3 = this;

            if (this.props.artist !== this.state.artist) {
                this.setState({ fontSize: 60, artist: this.props.artist }, function () {
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

            if (height > 150 || width > 375) {
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
                boxShadow: "0 0 13px 1px " + this.props.artist.colorToString()
            };

            var nameStyle = {
                fontSize: this.state.fontSize
            };

            return React.createElement(
                "div",
                { className: "nameAndPicture" },
                React.createElement("div", { className: "sidebarPicture", style: pictureStyle }),
                React.createElement(
                    "div",
                    { className: "name" },
                    React.createElement(
                        "h1",
                        { className: "sidebarArtistName", style: nameStyle,
                            ref: function ref(nameElement) {
                                _this4.nameElement = nameElement;
                            } },
                        this.props.artist.name
                    )
                )
            );
        }
    }]);

    return ArtistProfile;
}(React.Component);