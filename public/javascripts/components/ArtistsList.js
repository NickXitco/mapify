var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Order = {
    DEFAULT: 0,
    ALPHABETIC: 1,
    RANDOM: 2
};

var ArtistsList = function (_React$Component) {
    _inherits(ArtistsList, _React$Component);

    function ArtistsList(props) {
        _classCallCheck(this, ArtistsList);

        var _this = _possibleConstructorReturn(this, (ArtistsList.__proto__ || Object.getPrototypeOf(ArtistsList)).call(this, props));

        _this.state = {
            order: Order.RANDOM
        };

        _this.changeOrder = _this.changeOrder.bind(_this);
        return _this;
    }

    _createClass(ArtistsList, [{
        key: "changeOrder",
        value: function changeOrder(state) {
            this.setState({ order: state });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            if (this.props.artists.size === 0) {
                return null;
            }

            var relatedArray = [].concat(_toConsumableArray(this.props.artists));

            if (this.state.order === Order.ALPHABETIC) {
                relatedArray = relatedArray.sort(function (a, b) {
                    var nameA = a.name.toUpperCase();
                    var nameB = b.name.toUpperCase();
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                });
            } else if (this.state.order === Order.RANDOM) {
                relatedArray = shuffle(relatedArray);
            }

            var artists = relatedArray.map(function (artist) {
                return React.createElement(
                    "li",
                    { className: "sidebarListItem",
                        key: artist.id.toString(),
                        onClick: function onClick() {
                            _this2.props.loadArtistFromUI(artist);
                        },
                        onMouseEnter: function onMouseEnter() {
                            _this2.props.updateHoveredArtist(artist);
                        },
                        onMouseLeave: function onMouseLeave() {
                            _this2.props.updateHoveredArtist(null);
                        }
                    },
                    artist.name.toString()
                );
            });

            return React.createElement(
                "div",
                { className: "relatedArtistsSection" },
                React.createElement(
                    "div",
                    { className: "artistListHeader" },
                    React.createElement(
                        "h2",
                        null,
                        this.props.header
                    ),
                    React.createElement(MultiwaySwitch, {
                        newPosition: this.changeOrder,
                        states: 3
                    })
                ),
                React.createElement(
                    "ul",
                    { className: "relatedArtistsList" },
                    artists
                )
            );
        }
    }]);

    return ArtistsList;
}(React.Component);