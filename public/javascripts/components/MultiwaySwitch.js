var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SWITCH_STATES = {
    FOLLOWERS: {
        icon: 'images/bubbles.svg',
        hoverText: 'Followers'
    },
    ALPHABETICAL: {
        icon: 'images/az.svg',
        hoverText: 'Alphabetical'
    },
    RANDOM: {
        icon: 'images/dice.svg',
        hoverText: 'Random'
    }
};

var MultiwaySwitch = function (_React$Component) {
    _inherits(MultiwaySwitch, _React$Component);

    function MultiwaySwitch(props) {
        _classCallCheck(this, MultiwaySwitch);

        var _this = _possibleConstructorReturn(this, (MultiwaySwitch.__proto__ || Object.getPrototypeOf(MultiwaySwitch)).call(this, props));

        _this.state = {
            position: 0,
            states: _this.props.states
        };

        _this.setPositionFromClick = _this.setPositionFromClick.bind(_this);
        return _this;
    }

    _createClass(MultiwaySwitch, [{
        key: 'setPositionFromClick',
        value: function setPositionFromClick(pos) {
            this.setState({ position: pos });
            this.props.newPosition(pos);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var ballStyle = {
                marginLeft: Utils.lerp(0, this.state.states.length * 22 * 1.5 - 22, this.state.position / (this.state.states.length - 1)) + 'px'
            };

            console.log('Rerender!');
            console.log(this.state);

            var boxStyle = {
                width: this.state.states.length * 22 * 1.5 + 'px'
            };

            var listItemStyle = {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px'
            };

            var stateLabels = this.state.states.map(function (state, i) {
                return React.createElement(
                    'li',
                    { key: i, style: listItemStyle },
                    React.createElement(MultiwaySwitchButton, { switchState: state, position: i, click: _this2.setPositionFromClick })
                );
            });

            return React.createElement(
                'div',
                { className: "switchContainer" },
                React.createElement(
                    'div',
                    { className: "switchBox", style: boxStyle },
                    React.createElement('div', {
                        className: "switchBall",
                        style: ballStyle
                    }),
                    React.createElement(
                        'ul',
                        { className: "stateLabels" },
                        stateLabels
                    )
                )
            );
        }
    }]);

    return MultiwaySwitch;
}(React.Component);