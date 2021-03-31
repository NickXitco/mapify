var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MultiwaySwitchButton = function (_React$Component) {
    _inherits(MultiwaySwitchButton, _React$Component);

    function MultiwaySwitchButton(props) {
        _classCallCheck(this, MultiwaySwitchButton);

        var _this = _possibleConstructorReturn(this, (MultiwaySwitchButton.__proto__ || Object.getPrototypeOf(MultiwaySwitchButton)).call(this, props));

        _this.state = {
            switchState: _this.props.switchState,
            position: _this.props.position,
            showTooltip: false
        };

        _this.setHover = _this.setHover.bind(_this);
        _this.unsetHover = _this.unsetHover.bind(_this);
        _this.clickHandler = _this.clickHandler.bind(_this);
        return _this;
    }

    _createClass(MultiwaySwitchButton, [{
        key: 'setHover',
        value: function setHover() {
            this.setState({ showTooltip: true });
        }
    }, {
        key: 'unsetHover',
        value: function unsetHover() {
            this.setState({ showTooltip: false });
        }
    }, {
        key: 'clickHandler',
        value: function clickHandler() {
            this.props.click(this.state.position);
        }
    }, {
        key: 'render',
        value: function render() {
            var tooltipStyle = {
                visibility: this.state.showTooltip ? 'visible' : 'hidden'
            };

            return React.createElement(
                'div',
                { className: "stateLabel",
                    onMouseEnter: this.setHover,
                    onMouseLeave: this.unsetHover,
                    onClick: this.clickHandler
                },
                React.createElement(
                    'p',
                    { className: "tooltip", style: tooltipStyle },
                    this.state.switchState.hoverText
                ),
                React.createElement('img', { className: "stateImage", src: this.state.switchState.icon, alt: this.state.switchState.hoverText })
            );
        }
    }]);

    return MultiwaySwitchButton;
}(React.Component);