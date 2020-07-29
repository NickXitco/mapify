var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Changelog = function (_React$Component) {
    _inherits(Changelog, _React$Component);

    function Changelog(props) {
        _classCallCheck(this, Changelog);

        return _possibleConstructorReturn(this, (Changelog.__proto__ || Object.getPrototypeOf(Changelog)).call(this, props));
    }

    _createClass(Changelog, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var changelist = this.props.changes.map(function (change, index) {
                return React.createElement(
                    "li",
                    { className: "changelog-list-item",
                        key: index.toString()
                    },
                    change
                );
            });

            return React.createElement(
                "div",
                { className: "changelog",
                    onClick: function onClick() {
                        _this2.props.tryRemoveChangelog();
                    }
                },
                React.createElement(
                    "div",
                    { className: "changelog-inner",
                        onMouseEnter: function onMouseEnter() {
                            console.log("enter!");
                            _this2.props.updateHoverFlag(true);
                        },
                        onMouseLeave: function onMouseLeave() {
                            console.log("leave!");
                            _this2.props.updateHoverFlag(false);
                        }
                    },
                    React.createElement(
                        "h2",
                        null,
                        "Version ",
                        this.props.version
                    ),
                    React.createElement(
                        "h3",
                        null,
                        this.props.headline
                    ),
                    React.createElement(
                        "ul",
                        { className: "changelog-list" },
                        changelist
                    )
                )
            );
        }
    }]);

    return Changelog;
}(React.Component);