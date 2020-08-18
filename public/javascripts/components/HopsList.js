var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HopsList = function (_React$Component) {
    _inherits(HopsList, _React$Component);

    function HopsList(props) {
        _classCallCheck(this, HopsList);

        return _possibleConstructorReturn(this, (HopsList.__proto__ || Object.getPrototypeOf(HopsList)).call(this, props));
    }

    _createClass(HopsList, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            if (this.props.path.length === 0) {
                return null;
            }

            var artists = this.props.path.map(function (artist, index) {
                var line = void 0;

                if (index === _this2.props.path.length - 1) {
                    line = null;
                } else {
                    line = React.createElement('div', {
                        style: {
                            position: 'static',
                            background: 'linear-gradient(180deg, ' + artist.colorToString() + ', ' + _this2.props.path[index + 1].colorToString() + ')',
                            height: '100px',
                            width: '2px',
                            marginLeft: '62px',
                            marginTop: '-23px',
                            marginBottom: '-33px'
                        }
                    });
                }

                return React.createElement(
                    'li',
                    { className: "hopListItem",
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
                    React.createElement(ArtistProfile, { artist: artist, fontDecrement: 3, showPlayer: false, size: "Medium", align: 'left' }),
                    line
                );
            });

            return React.createElement(
                'div',
                { className: "hopListSection" },
                React.createElement(
                    'ol',
                    { className: "hopList" },
                    artists
                )
            );
        }
    }]);

    return HopsList;
}(React.Component);