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
                    React.createElement(
                        'span',
                        { style: { position: 'static', fontWeight: 700, fontSize: '24px' } },
                        index + 1 + '.'
                    ),
                    ' ' + artist.name.toString()
                );
            });

            return React.createElement(
                'div',
                { className: "relatedArtistsSection" },
                React.createElement(
                    'h2',
                    null,
                    this.props.header
                ),
                React.createElement(
                    'ol',
                    { className: "relatedArtistsList" },
                    artists
                )
            );
        }
    }]);

    return HopsList;
}(React.Component);