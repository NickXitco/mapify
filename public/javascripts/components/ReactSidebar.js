var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactSidebar = function (_React$Component) {
    _inherits(ReactSidebar, _React$Component);

    function ReactSidebar(props) {
        _classCallCheck(this, ReactSidebar);

        var _this = _possibleConstructorReturn(this, (ReactSidebar.__proto__ || Object.getPrototypeOf(ReactSidebar)).call(this, props));

        _this.state = {
            artist: null,
            genre: null
        };

        _this.updateSidebarContent = _this.updateSidebarContent.bind(_this);
        return _this;
    }

    _createClass(ReactSidebar, [{
        key: "updateSidebarContent",
        value: function updateSidebarContent(artist, genre) {
            if (this.state.artist !== artist || this.state.genre !== genre) {
                this.setState({ artist: artist, genre: genre });
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var player = null;

            if (this.props.path.length > 0) {
                var start = this.props.path[0];
                var end = this.props.path[this.props.path.length - 1];

                var color = ColorUtilities.rgbToString(start.r, start.g, start.b);
                var darkerColor = ColorUtilities.rgbToString(start.r / 4, start.g / 4, start.b / 4);

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
                        "::-webkit-scrollbar-track {box-shadow: 0 0 5px " + start.colorToString() + ";}  \n" + ("::-webkit-scrollbar-thumb {background: " + start.colorToString() + ";")
                    ),
                    React.createElement(SidebarStroke, { color: start.colorToString() }),
                    React.createElement(ArtistProfile, { artist: start, fontDecrement: 3 }),
                    React.createElement(
                        "svg",
                        { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32",
                            style: { position: 'static', height: '50px', filter: "drop-shadow(0 0  5px " + color + ")" } },
                        React.createElement("path", { fill: darkerColor, stroke: "white", d: "M16.5 28.75l10-13H21V3.25h-9v12.5H6.5l10 13z" })
                    ),
                    React.createElement(ArtistProfile, { artist: end, fontDecrement: 3 })
                );
            }

            if (!this.props.artist && !this.props.genre) {
                if (this.state.artist) {
                    setTimeout(function () {
                        return _this2.setState({ artist: null });
                    }, 600);

                    if (this.state.artist.track) {
                        player = React.createElement(Player, { uri: "spotify:track:" + this.state.artist.track.id });
                    }

                    return React.createElement(
                        "div",
                        { className: "sidebar sidebar-closed",
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
                            "::-webkit-scrollbar-track {box-shadow: 0 0 5px " + this.state.artist.colorToString() + ";}  \n" + ("::-webkit-scrollbar-thumb {background: " + this.state.artist.colorToString() + ";")
                        ),
                        React.createElement(SidebarStroke, { color: this.state.artist.colorToString() }),
                        React.createElement(ArtistProfile, { artist: this.state.artist, fontDecrement: 3 }),
                        React.createElement(FollowersStats, { artist: this.state.artist }),
                        player,
                        React.createElement(
                            "p",
                            { style: { padding: "10px 22px", fontSize: "12px" } },
                            "Headphone warning, this can be pretty loud"
                        ),
                        React.createElement(GenresList, { genres: this.state.artist.genres,
                            loadGenreFromSearch: this.props.loadGenreFromSearch,
                            header: "Genres"
                        }),
                        React.createElement(ArtistsList, { artists: this.state.artist.relatedVertices,
                            loadArtistFromUI: this.props.loadArtistFromUI,
                            updateHoveredArtist: this.props.updateHoveredArtist,
                            header: "Related Artists"
                        }),
                        React.createElement(UndoRedoComponent, {
                            color: [this.state.artist.r, this.state.artist.g, this.state.artist.b],
                            sidebarState: this.props.sidebarState,
                            undoSidebarState: this.props.undoSidebarState,
                            redoSidebarState: this.props.redoSidebarState
                        })
                    );
                }
                if (this.state.genre) {
                    return React.createElement(
                        "div",
                        { className: "sidebar sidebar-closed",
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
                            "::-webkit-scrollbar-track {box-shadow: 0 0 5px " + this.state.genre.colorToString() + ";}  \n" + ("::-webkit-scrollbar-thumb {background: " + this.state.genre.colorToString() + ";")
                        ),
                        React.createElement(SidebarStroke, { color: this.state.genre.colorToString() }),
                        React.createElement(GenreProfile, { genre: this.state.genre, fontDecrement: 3 }),
                        React.createElement(ArtistsList, { artists: this.state.genre.nodes,
                            loadArtistFromUI: this.props.loadArtistFromUI,
                            updateHoveredArtist: this.props.updateHoveredArtist,
                            header: "Artists in Genre"
                        }),
                        React.createElement(UndoRedoComponent, {
                            color: [this.state.genre.r, this.state.genre.g, this.state.genre.b],
                            sidebarState: this.props.sidebarState,
                            undoSidebarState: this.props.undoSidebarState,
                            redoSidebarState: this.props.redoSidebarState
                        })
                    );
                }
                return React.createElement(
                    "div",
                    { className: "sidebar sidebar-closed",
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
                        "::-webkit-scrollbar-track {box-shadow: 0 0 5px white;}  \n" + "::-webkit-scrollbar-thumb {background: white};"
                    ),
                    React.createElement(SidebarStroke, { color: 'white' })
                );
            }

            this.updateSidebarContent(this.props.artist, this.props.genre);

            if (this.props.artist) {
                if (this.props.artist.track) {
                    player = React.createElement(Player, { uri: "spotify:track:" + this.props.artist.track.id });
                }

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
                    player,
                    React.createElement(
                        "p",
                        { style: { padding: "10px 22px", fontSize: "12px" } },
                        "Headphone warning, this can be pretty loud"
                    ),
                    React.createElement(GenresList, { genres: this.props.artist.genres,
                        loadGenreFromSearch: this.props.loadGenreFromSearch,
                        header: "Genres"
                    }),
                    React.createElement(ArtistsList, { artists: this.props.artist.relatedVertices,
                        loadArtistFromUI: this.props.loadArtistFromUI,
                        updateHoveredArtist: this.props.updateHoveredArtist,
                        header: "Related Artists"
                    }),
                    React.createElement(UndoRedoComponent, {
                        color: [this.props.artist.r, this.props.artist.g, this.props.artist.b],
                        sidebarState: this.props.sidebarState,
                        undoSidebarState: this.props.undoSidebarState,
                        redoSidebarState: this.props.redoSidebarState
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
                    }),
                    React.createElement(UndoRedoComponent, {
                        color: [this.props.genre.r, this.props.genre.g, this.props.genre.b],
                        sidebarState: this.props.sidebarState,
                        undoSidebarState: this.props.undoSidebarState,
                        redoSidebarState: this.props.redoSidebarState
                    })
                );
            }
        }
    }]);

    return ReactSidebar;
}(React.Component);