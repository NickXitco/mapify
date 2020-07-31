var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactSidebar = function (_React$Component) {
    _inherits(ReactSidebar, _React$Component);

    function ReactSidebar(props) {
        _classCallCheck(this, ReactSidebar);

        return _possibleConstructorReturn(this, (ReactSidebar.__proto__ || Object.getPrototypeOf(ReactSidebar)).call(this, props));
    }

    _createClass(ReactSidebar, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            if (!this.props.artist && !this.props.genre) {
                return React.createElement(
                    "div",
                    { className: "sidebar sidebar-closed",
                        onMouseEnter: function onMouseEnter() {
                            _this2.props.updateHoverFlag(true);
                        },
                        onMouseLeave: function onMouseLeave() {
                            _this2.props.updateHoverFlag(false);
                        } },
                    React.createElement(SidebarStroke, { color: "white" })
                );
            }

            if (this.props.artist) {
                return React.createElement(
                    "div",
                    { className: "sidebar sidebar-open",
                        onMouseEnter: function onMouseEnter() {
                            _this2.props.updateHoverFlag(true);
                        },
                        onMouseLeave: function onMouseLeave() {
                            _this2.props.updateHoverFlag(false);
                        }
                    },
                    React.createElement(
                        "style",
                        null,
                        "::-webkit-scrollbar-track {box-shadow: 0 0 5px " + this.props.artist.colorToString() + ";}  \n" + ("::-webkit-scrollbar-thumb {background: " + this.props.artist.colorToString() + ";")
                    ),
                    React.createElement(SidebarStroke, { color: this.props.artist.colorToString() }),
                    React.createElement(ArtistProfile, { artist: this.props.artist, fontDecrement: 3 }),
                    React.createElement(FollowersStats, { artist: this.props.artist }),
                    React.createElement(GenresList, { genres: this.props.artist.genres,
                        loadGenreFromSearch: this.props.loadGenreFromSearch,
                        header: "Genres"
                    }),
                    React.createElement(ArtistsList, { artists: this.props.artist.relatedVertices,
                        loadArtistFromUI: this.props.loadArtistFromUI,
                        updateHoveredArtist: this.props.updateHoveredArtist,
                        header: "Related Artists"
                    })
                );
            }

            if (this.props.genre) {
                return React.createElement(
                    "div",
                    { className: "sidebar sidebar-open",
                        onMouseEnter: function onMouseEnter() {
                            _this2.props.updateHoverFlag(true);
                        },
                        onMouseLeave: function onMouseLeave() {
                            _this2.props.updateHoverFlag(false);
                        }
                    },
                    React.createElement(
                        "style",
                        null,
                        "::-webkit-scrollbar-track {box-shadow: 0 0 5px " + this.props.genre.colorToString() + ";}  \n" + ("::-webkit-scrollbar-thumb {background: " + this.props.genre.colorToString() + ";")
                    ),
                    React.createElement(SidebarStroke, { color: this.props.genre.colorToString() }),
                    React.createElement(GenreProfile, { genre: this.props.genre, fontDecrement: 3 }),
                    React.createElement(ArtistsList, { artists: this.props.genre.nodes,
                        loadArtistFromUI: this.props.loadArtistFromUI,
                        updateHoveredArtist: this.props.updateHoveredArtist,
                        header: "Artists in Genre"
                    })
                );
            }
        }
    }]);

    return ReactSidebar;
}(React.Component);