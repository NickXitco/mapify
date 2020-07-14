var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactSearchBox = function (_React$Component) {
    _inherits(ReactSearchBox, _React$Component);

    function ReactSearchBox(props) {
        _classCallCheck(this, ReactSearchBox);

        var _this = _possibleConstructorReturn(this, (ReactSearchBox.__proto__ || Object.getPrototypeOf(ReactSearchBox)).call(this, props));

        _this.sendSubmitIfEnter = _this.sendSubmitIfEnter.bind(_this);
        return _this;
    }

    _createClass(ReactSearchBox, [{
        key: "sendSubmitIfEnter",
        value: function sendSubmitIfEnter(e) {
            if (e.key === "Enter") {
                this.props.processSearchSubmit(e.target.value);
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            if (!this.props.artist) {
                return null;
            }

            var color = {
                borderColor: this.props.artist.colorToString(),
                boxShadow: "0 0 6px 0.5px " + this.props.artist.colorToString()
            };

            var results = this.props.results.map(function (artist) {
                return React.createElement(
                    "li",
                    { className: "suggestion",
                        key: artist.id.toString(),
                        onClick: function onClick() {
                            _this2.props.updateClickedArtist(artist);
                        }
                    },
                    React.createElement(
                        "div",
                        { className: "suggestedArtist" },
                        React.createElement(
                            "p",
                            null,
                            artist.name.toString()
                        )
                    )
                );
            });

            return React.createElement(
                "div",
                { className: "searchBox" },
                React.createElement(
                    "div",
                    { className: "searchBar" },
                    React.createElement("input", { className: "searchInput",
                        style: color,
                        type: "text",
                        placeholder: "search for an artist...",
                        onInput: function onInput(e) {
                            _this2.props.processSearchInputChange(e.target.value);
                        },
                        onKeyDown: this.sendSubmitIfEnter
                    })
                ),
                React.createElement(
                    "ul",
                    { className: "suggestions" },
                    results
                )
            );
        }
    }]);

    return ReactSearchBox;
}(React.Component);