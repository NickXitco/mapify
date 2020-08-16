var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FollowersStats = function (_React$Component) {
    _inherits(FollowersStats, _React$Component);

    function FollowersStats(props) {
        _classCallCheck(this, FollowersStats);

        return _possibleConstructorReturn(this, (FollowersStats.__proto__ || Object.getPrototypeOf(FollowersStats)).call(this, props));
    }

    _createClass(FollowersStats, [{
        key: "render",
        value: function render() {

            return React.createElement(
                "div",
                { className: this.props.size === "Small" ? "followersSectionSmall" : "followersSection" },
                React.createElement(
                    "p",
                    { className: "followerCount" },
                    this.props.artist.followers >= 1000000 ? (this.props.artist.followers * 1.0 / 1000000).toFixed(1).toString() + " Million" : this.props.artist.followers >= 1000 ? (this.props.artist.followers * 1.0 / 1000).toFixed(1).toString() + " Thousand" : this.props.artist.followers.toString()
                ),
                React.createElement(
                    "p",
                    { className: "followers" },
                    this.props.artist.followers === 1 ? "Follower" : "Followers"
                ),
                React.createElement("p", { className: "followerRanking" })
            );
        }
    }]);

    return FollowersStats;
}(React.Component);