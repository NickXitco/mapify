var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactSearchBox = function (_React$Component) {
    _inherits(ReactSearchBox, _React$Component);

    function ReactSearchBox(props) {
        _classCallCheck(this, ReactSearchBox);

        var _this = _possibleConstructorReturn(this, (ReactSearchBox.__proto__ || Object.getPrototypeOf(ReactSearchBox)).call(this, props));

        _this.state = {
            value: "",
            suggestions: []
        };

        _this.requestCounter = 0;
        _this.highestReceivedResponse = 0;

        _this.processInput = _this.processInput.bind(_this);
        _this.processSuggestions = _this.processSuggestions.bind(_this);
        _this.processSuggestionClick = _this.processSuggestionClick.bind(_this);

        _this.resetState = _this.resetState.bind(_this);

        _this.sendSubmitIfEnter = _this.sendSubmitIfEnter.bind(_this);
        return _this;
    }

    _createClass(ReactSearchBox, [{
        key: "processInput",
        value: function processInput(e) {
            var _this2 = this;

            var currentInput = e.target.value.valueOf().toString();
            this.setState({ value: currentInput });
            var url = "artistSearch/" + encodeURIComponent(currentInput);

            var currentCount = this.requestCounter.valueOf();

            this.requestCounter++;

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (data) {
                //Only accept a response if it's the latest request we've gotten back
                if (currentCount > _this2.highestReceivedResponse) {
                    _this2.highestReceivedResponse = currentCount;
                    _this2.processSuggestions(data);
                }
            });
        }
    }, {
        key: "processSuggestions",
        value: function processSuggestions(data) {
            this.setState({ suggestions: data });
        }
    }, {
        key: "processSuggestionClick",
        value: function processSuggestionClick(artist) {
            this.props.loadArtistFromUI(artist);
            this.resetState();
        }
    }, {
        key: "sendSubmitIfEnter",
        value: function sendSubmitIfEnter(e) {
            if (e.key === "Enter") {
                this.props.loadArtistFromSearch(e.target.value);
                this.resetState();
            }
        }
    }, {
        key: "resetState",
        value: function resetState() {
            this.setState({ value: "", suggestions: [] });
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var color = this.props.artist ? this.props.artist.colorToString() : "white";

            var colorStyle = {
                borderColor: color,
                boxShadow: "0 0 6px 0.5px " + color
            };

            var suggestions = this.state.suggestions.map(function (artist) {
                return React.createElement(
                    "li",
                    { className: "suggestion",
                        key: artist.id.toString()
                    },
                    React.createElement(
                        "p",
                        { className: "suggestedArtist",
                            onClick: function onClick() {
                                _this3.processSuggestionClick(artist);
                            } },
                        artist.name.toString()
                    )
                );
            });

            if (suggestions.length === 0 && this.state.value.length > 0) {
                suggestions.push(React.createElement(
                    "li",
                    { className: "suggestion",
                        key: "noResults"
                    },
                    React.createElement(
                        "p",
                        { className: "suggestedArtist" },
                        "No Results Found."
                    )
                ));
            }

            return React.createElement(
                "div",
                { className: "searchBox",
                    onMouseEnter: function onMouseEnter() {
                        _this3.props.updateHoverFlag(true);
                    },
                    onMouseLeave: function onMouseLeave() {
                        _this3.props.updateHoverFlag(false);
                    }
                },
                React.createElement(
                    "div",
                    { className: "searchBar" },
                    React.createElement("input", { className: "searchInput",
                        style: colorStyle,
                        type: "text",
                        placeholder: "search for an artist...",
                        onInput: this.processInput,
                        onKeyDown: this.sendSubmitIfEnter,
                        value: this.state.value
                    })
                ),
                React.createElement(
                    "ul",
                    { className: "suggestions" },
                    suggestions
                )
            );
        }
    }]);

    return ReactSearchBox;
}(React.Component);