var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ArtistsList = function (_React$Component) {
    _inherits(ArtistsList, _React$Component);

    function ArtistsList(props) {
        _classCallCheck(this, ArtistsList);

        return _possibleConstructorReturn(this, (ArtistsList.__proto__ || Object.getPrototypeOf(ArtistsList)).call(this, props));
    }

    _createClass(ArtistsList, [{
        key: "render",
        value: function render() {
            if (this.props.artists.size === 0) {
                return null;
            }

            var relatedArray = [].concat(_toConsumableArray(this.props.artists));

            var artists = relatedArray.map(function (artist) {
                return React.createElement(
                    "li",
                    { className: "sidebarListItem", key: artist.id.toString() },
                    artist.name.toString()
                );
            });

            return React.createElement(
                "div",
                { className: "relatedArtistsSection" },
                React.createElement(
                    "h2",
                    null,
                    "Related Artists"
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