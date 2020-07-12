var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Clock = function (_React$Component) {
    _inherits(Clock, _React$Component);

    function Clock(props) {
        _classCallCheck(this, Clock);

        var _this = _possibleConstructorReturn(this, (Clock.__proto__ || Object.getPrototypeOf(Clock)).call(this, props));

        _this.state = { date: new Date() };
        return _this;
    }

    //Allocate and set up resources when the clock is rendered


    _createClass(Clock, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            this.timerID = setInterval(function () {
                return _this2.tick();
            }, 1000);
        }

        //Remove anc clear resources when the clock is removed

    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            clearInterval(this.timerID);
        }
    }, {
        key: "tick",
        value: function tick() {
            this.setState({
                date: new Date()
            });
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "h1",
                    null,
                    "Hello, world!"
                ),
                React.createElement(
                    "h2",
                    null,
                    "It is ",
                    this.state.date.toLocaleTimeString(),
                    "."
                )
            );
        }

        /*
            https://reactjs.org/docs/state-and-lifecycle.html
         */

    }]);

    return Clock;
}(React.Component);

var ReactSidebar = function (_React$Component2) {
    _inherits(ReactSidebar, _React$Component2);

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
        }
    }]);

    return ReactSidebar;
}(React.Component);

/*

So here's the plan as I see it.

We have an App component that holds:
    -Info Box
    -Search Box
    -Sidebar
    -Future UI
    -THE CANVAS :O
        * For the record, I have only a semblance of an idea how I'm gonna pull this
          off. I don't yet have the grasp on React to execute this correctly first
          time so it will probably be a trial by fire.
 */

var App = function (_React$Component3) {
    _inherits(App, _React$Component3);

    function App(props) {
        _classCallCheck(this, App);

        return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));
    }

    _createClass(App, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "fullScreen" },
                React.createElement(P5Wrapper, null),
                React.createElement(ReactSidebar, null)
            );
        }
    }]);

    return App;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));