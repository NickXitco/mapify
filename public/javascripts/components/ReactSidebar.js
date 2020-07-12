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
        key: "componentDidMount",
        value: function componentDidMount() {}
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {}
    }, {
        key: "render",
        value: function render() {
            if (this.props.type === "artist") {
                return React.createElement(
                    "div",
                    { className: "sidebar" },
                    React.createElement("div", { className: "sidebarStroke" }),
                    React.createElement(
                        "div",
                        { className: "nameAndPicture" },
                        React.createElement("div", { className: "sidebarPicture" }),
                        React.createElement(
                            "div",
                            { className: "name" },
                            React.createElement("h1", { className: "sidebarArtistName" })
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "followersSection" },
                        React.createElement("p", { className: "followerCount" }),
                        React.createElement("p", { className: "followers" }),
                        React.createElement("p", { className: "followerRanking" })
                    ),
                    React.createElement(
                        "div",
                        { className: "genresSection" },
                        React.createElement(
                            "h2",
                            null,
                            "Genres"
                        ),
                        React.createElement("ul", { className: "genresList" })
                    ),
                    React.createElement(
                        "div",
                        { className: "relatedArtistsSection" },
                        React.createElement(
                            "h2",
                            null,
                            "Related Artists"
                        ),
                        React.createElement("ul", { className: "relatedArtistsList" })
                    )
                );
            } else {
                return null;
            }
        }
    }]);

    return ReactSidebar;
}(React.Component);