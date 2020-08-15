var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ShortestPathDialog = function (_React$Component) {
    _inherits(ShortestPathDialog, _React$Component);

    function ShortestPathDialog(props) {
        _classCallCheck(this, ShortestPathDialog);

        var _this = _possibleConstructorReturn(this, (ShortestPathDialog.__proto__ || Object.getPrototypeOf(ShortestPathDialog)).call(this, props));

        _this.state = {
            tooltip: false,
            hoverState: 0,

            startValue: "",
            endValue: "",
            startSuggestions: [],
            endSuggestions: [],

            startArtist: null,
            endArtist: null
        };

        _this.requestCounter = 0;
        _this.highestReceivedResponse = 0;

        _this.processInput = _this.processInput.bind(_this);
        _this.processSuggestions = _this.processSuggestions.bind(_this);
        _this.processSuggestionClick = _this.processSuggestionClick.bind(_this);

        _this.sendSubmitIfEnter = _this.sendSubmitIfEnter.bind(_this);
        _this.getPath = _this.getPath.bind(_this);
        return _this;
    }

    _createClass(ShortestPathDialog, [{
        key: "processInput",
        value: function processInput(e, start) {
            var _this2 = this;

            var currentInput = e.target.value.valueOf().toString();

            if (start) {
                this.setState({ startValue: currentInput, startArtist: null });
            } else {
                this.setState({ endValue: currentInput, endArtist: null });
            }

            var url = "artistSearch/" + encodeURIComponent(currentInput);

            var currentCount = this.requestCounter.valueOf();

            this.requestCounter++;

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (data) {
                //Only accept a response if it's the latest request we've gotten back
                if (currentCount > _this2.highestReceivedResponse) {
                    _this2.highestReceivedResponse = currentCount;
                    _this2.processSuggestions(data, start);
                }
            });
        }
    }, {
        key: "processSuggestions",
        value: function processSuggestions(data, start) {
            if (start) {
                this.setState({ startSuggestions: this.props.createNodesFromSuggestions(data.artists) });
            } else {
                this.setState({ endSuggestions: this.props.createNodesFromSuggestions(data.artists) });
            }
        }
    }, {
        key: "processSuggestionClick",
        value: function processSuggestionClick(artist, start) {
            if (start) {
                this.setState({ startValue: artist.name, startArtist: artist, startSuggestions: [] });
            } else {
                this.setState({ endValue: artist.name, endArtist: artist, endSuggestions: [] });
            }
            this.props.updateHoveredArtist(null);
        }
    }, {
        key: "sendSubmitIfEnter",
        value: function sendSubmitIfEnter(e) {
            if (e.key === "Enter") {
                this.getPath();
            }
        }
    }, {
        key: "getPath",
        value: function getPath() {
            var _this3 = this;

            var start = this.state.startArtist ? this.state.startArtist : this.state.startSuggestions.length > 0 ? this.state.startSuggestions[0] : null;
            var end = this.state.endArtist ? this.state.endArtist : this.state.endSuggestions.length > 0 ? this.state.endSuggestions[0] : null;
            if (start && end) {
                fetch("path/" + start.id + "/" + end.id).then(function (res) {
                    return res.json();
                }).then(function (path) {
                    return _this3.props.updatePath(path);
                });
            }
        }
    }, {
        key: "resetState",
        value: function resetState(start) {
            if (start) {
                this.setState({ startValue: "", startSuggestions: [] });
            } else {
                this.setState({ endValue: "", endSuggestions: [] });
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this4 = this;

            if (this.state.startValue.length === 0 && this.state.startSuggestions.length > 0) {
                this.resetState(true);
            }

            if (this.state.endValue.length === 0 && this.state.endSuggestions.length > 0) {
                this.resetState(false);
            }

            var colorStyle = {};
            var borderClassName = "";
            var expandClass = this.props.expanded ? "uiButtonOuterExpand" : this.state.hoverState === 1 ? "uiButtonOuterHover" : "";

            var color = this.props.colorant ? this.props.colorant.colorToString() : 'white';

            switch (this.state.hoverState) {
                case 0:
                    colorStyle = {
                        borderColor: color,
                        boxShadow: "0 0 10px 0 " + color + ", inset 0 0 5px 0 " + color
                    };
                    break;
                case 1:
                    colorStyle = {
                        borderColor: color,
                        boxShadow: "0 0 15px 0 " + color + ", inset 0 0 10px 0 " + color
                    };
                    break;
            }

            var startArtistsList = void 0,
                endArtistsList = void 0;

            if (this.state.startSuggestions.length > 0) {
                startArtistsList = React.createElement(
                    "ul",
                    { className: "suggestions" },
                    this.state.startSuggestions.map(function (artist) {
                        return React.createElement(
                            "li",
                            { className: "suggestion",
                                key: artist.id.toString()
                            },
                            React.createElement(
                                "p",
                                { className: "suggestedArtist",
                                    onClick: function onClick() {
                                        _this4.processSuggestionClick(artist, true);
                                    },
                                    onMouseEnter: function onMouseEnter() {
                                        _this4.props.updateHoveredArtist(artist);
                                    },
                                    onMouseLeave: function onMouseLeave() {
                                        _this4.props.updateHoveredArtist(null);
                                    }
                                },
                                artist.name.toString()
                            )
                        );
                    })
                );
            }

            if (this.state.endSuggestions.length > 0) {
                endArtistsList = React.createElement(
                    "ul",
                    { className: "suggestions" },
                    this.state.endSuggestions.map(function (artist) {
                        return React.createElement(
                            "li",
                            { className: "suggestion",
                                key: artist.id.toString()
                            },
                            React.createElement(
                                "p",
                                { className: "suggestedArtist",
                                    onClick: function onClick() {
                                        _this4.processSuggestionClick(artist, false);
                                    },
                                    onMouseEnter: function onMouseEnter() {
                                        _this4.props.updateHoveredArtist(artist);
                                    },
                                    onMouseLeave: function onMouseLeave() {
                                        _this4.props.updateHoveredArtist(null);
                                    }
                                },
                                artist.name.toString()
                            )
                        );
                    })
                );
            }

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "uiButtonOuter " + borderClassName + " " + expandClass,
                        style: colorStyle,

                        onMouseEnter: function onMouseEnter() {
                            if (!_this4.props.expanded) {
                                _this4.setState({ hoverState: 1 });
                            }
                            _this4.props.updateHoverFlag(true);
                        },

                        onMouseLeave: function onMouseLeave() {
                            _this4.setState({ hoverState: 0 });
                            _this4.props.updateHoverFlag(false);
                        },

                        onClick: function onClick() {
                            _this4.props.clickHandler();
                            _this4.setState({ hoverState: 0 });
                        }
                    },
                    React.createElement(
                        "svg",
                        { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32", className: "uiButton" },
                        React.createElement("path", { d: "M16 3.5L3.5 16 16 28.5 28.5 16zm2.25 15.3v-2.32H14.5a.41.41 0 00-.42.41v5a.41.41 0 01-.41.42h-2.92v-8.75a.42.42 0 01.42-.42h6.66a.41.41 0 00.42-.41v-1.92a.42.42 0 01.71-.29l4.29 4.29L19 19.1a.42.42 0 01-.75-.3z",
                            className: "uiButtonPath"
                        })
                    ),
                    React.createElement(
                        "h4",
                        { className: "uiButtonTitle" },
                        "SHORTEST PATH"
                    ),
                    React.createElement(
                        "div",
                        { className: "shortestPathForm" },
                        React.createElement(
                            "label",
                            null,
                            "START"
                        ),
                        React.createElement(
                            "div",
                            { className: "shortestPathSearch" },
                            React.createElement("input", { className: "searchInput " + borderClassName,
                                style: colorStyle,
                                type: "text",
                                placeholder: "search for an artist",
                                onInput: function onInput(e) {
                                    _this4.processInput(e, true);
                                },
                                onKeyDown: function onKeyDown(e) {
                                    _this4.sendSubmitIfEnter(e, true);
                                },
                                value: this.state.startValue
                            })
                        ),
                        startArtistsList,
                        React.createElement(
                            "label",
                            null,
                            "END"
                        ),
                        React.createElement(
                            "div",
                            { className: "shortestPathSearch" },
                            React.createElement("input", { className: "searchInput " + borderClassName,
                                style: colorStyle,
                                type: "text",
                                placeholder: "search for an artist",
                                onInput: function onInput(e) {
                                    _this4.processInput(e, false);
                                },
                                onKeyDown: function onKeyDown(e) {
                                    _this4.sendSubmitIfEnter(e, false);
                                },
                                value: this.state.endValue
                            })
                        ),
                        endArtistsList
                    ),
                    React.createElement(
                        "button",
                        { className: "mapifyButton",
                            onClick: this.getPath
                        },
                        "GO"
                    )
                )
            );
        }
    }]);

    return ShortestPathDialog;
}(React.Component);