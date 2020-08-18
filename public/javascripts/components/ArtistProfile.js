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
                    _this2.decrementFontSize(_this2.props.size);
                });
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            var _this3 = this;

            if (this.props.artist !== this.state.artist) {
                this.setState({ fontSize: 60, artist: this.props.artist }, function () {
                    _this3.decrementFontSize(_this3.props.size);
                });
            }

            if (this.fontSizeUpdating) {
                this.decrementFontSize(this.props.size);
            }
        }
    }, {
        key: "decrementFontSize",
        value: function decrementFontSize(size) {
            var heightLimit = size === "Large" ? 113 : size === "Medium" ? 80 : 50;
            var widthLimit = size === "Large" ? 265 : size === "Medium" ? 280 : 320;
            var height = this.nameElement.clientHeight;
            var width = this.nameElement.clientWidth;

            if (height > heightLimit || width > widthLimit) {
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
                boxShadow: "0 0 13px 1px " + this.props.artist.colorToString() + ", inset 0 0 1px 2px " + this.props.artist.colorToString()
            };

            var nameStyle = {
                fontSize: this.state.fontSize

                //TODO default picture
            };var picture = null;

            if (this.props.artist.images.length > 0) {
                picture = React.createElement("img", { src: this.props.artist.images[0].url, alt: this.props.artist.name });
            }

            var player = null;

            if (this.props.artist.track && this.props.showPlayer) {
                player = React.createElement(Player, { uri: "spotify:track:" + this.props.artist.track.id });
            }

            if (this.props.size === "Large") {
                return React.createElement(
                    "div",
                    { style: { position: 'static' } },
                    React.createElement(
                        "div",
                        { className: "nameAndPictureLarge" },
                        React.createElement(
                            "div",
                            { className: "sidebarPictureLarge", style: pictureStyle },
                            picture
                        ),
                        React.createElement(
                            "div",
                            { className: "nameLarge" },
                            React.createElement(
                                "h1",
                                { className: "sidebarArtistNameLarge", style: nameStyle,
                                    ref: function ref(nameElement) {
                                        _this4.nameElement = nameElement;
                                    } },
                                this.props.artist.name
                            )
                        )
                    ),
                    React.createElement(FollowersStats, { artist: this.props.artist, size: "Large" }),
                    player
                );
            } else if (this.props.size === "Medium") {
                return React.createElement(
                    "div",
                    { style: { position: 'static' } },
                    React.createElement(
                        "div",
                        { className: "nameAndPictureMedium" },
                        React.createElement(
                            "div",
                            { className: "sidebarPictureMedium", style: pictureStyle },
                            picture
                        ),
                        React.createElement(
                            "div",
                            { className: "nameMedium" },
                            React.createElement(
                                "h1",
                                { className: "sidebarArtistNameMedium", style: nameStyle,
                                    ref: function ref(nameElement) {
                                        _this4.nameElement = nameElement;
                                    } },
                                this.props.artist.name
                            ),
                            React.createElement(FollowersStats, { artist: this.props.artist, size: "Small" })
                        )
                    ),
                    player
                );
            } else {
                if (this.props.align === "right") {
                    return React.createElement(
                        "div",
                        { style: { position: 'static' } },
                        React.createElement(
                            "div",
                            { className: "nameAndPictureSmallRight" },
                            React.createElement(
                                "div",
                                { className: "nameSmallRight" },
                                React.createElement(
                                    "h1",
                                    { className: "sidebarArtistNameSmall", style: nameStyle,
                                        ref: function ref(nameElement) {
                                            _this4.nameElement = nameElement;
                                        } },
                                    this.props.artist.name
                                ),
                                React.createElement(FollowersStats, { artist: this.props.artist, size: "Small" })
                            ),
                            React.createElement(
                                "div",
                                { className: "sidebarPictureSmall", style: pictureStyle },
                                picture
                            )
                        ),
                        player
                    );
                }

                return React.createElement(
                    "div",
                    { style: { position: 'static' } },
                    React.createElement(
                        "div",
                        { className: "nameAndPictureSmall" },
                        React.createElement(
                            "div",
                            { className: "sidebarPictureSmall", style: pictureStyle },
                            picture
                        ),
                        React.createElement(
                            "div",
                            { className: "nameSmall" },
                            React.createElement(
                                "h1",
                                { className: "sidebarArtistNameSmall", style: nameStyle,
                                    ref: function ref(nameElement) {
                                        _this4.nameElement = nameElement;
                                    } },
                                this.props.artist.name
                            ),
                            React.createElement(FollowersStats, { artist: this.props.artist, size: "Small" })
                        )
                    ),
                    player
                );
            }
        }
    }]);

    return ArtistProfile;
}(React.Component);