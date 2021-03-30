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

        _this.advancePosition = _this.advancePosition.bind(_this);
        _this.reportEvent = _this.reportEvent.bind(_this);
        _this.showTooltip = _this.showTooltip.bind(_this);
        _this.setPositionFromClick = _this.setPositionFromClick.bind(_this);
        return _this;
    }

    _createClass(MultiwaySwitch, [{
        key: 'advancePosition',
        value: function advancePosition() {
            var nextPos = (this.state.position + 1) % this.state.states.length;
            this.setState({
                position: nextPos
            });
            this.props.newPosition(nextPos);
        }
    }, {
        key: 'setPositionFromClick',
        value: function setPositionFromClick(e) {}
    }, {
        key: 'showTooltip',
        value: function showTooltip(e) {}
    }, {
        key: 'reportEvent',
        value: function reportEvent(e) {
            console.log(e.nativeEvent);
        }
    }, {
        key: 'render',
        value: function render() {
            var ballStyle = {
                marginLeft: Utils.lerp(0, this.state.states.length * 22 * 1.5 - 22, this.state.position / (this.state.states.length - 1)) + 'px'
            };

            var boxStyle = {
                width: this.state.states.length * 22 * 1.5 + 'px'
            };

            var stateLabels = this.state.states.map(function (state) {
                return React.createElement(
                    'li',
                    { className: "stateLabel",
                        key: state.hoverText
                    },
                    React.createElement('img', { className: "stateImage", src: state.icon, alt: state.hoverText, title: state.hoverText })
                );
            });

            return React.createElement(
                'div',
                { className: "switchContainer",
                    onClick: this.setPositionFromClick,
                    onMouseMove: this.showTooltip
                },
                React.createElement(
                    'div',
                    { className: "switchBox", style: boxStyle },
                    React.createElement('div', {
                        className: "switchBall",
                        style: ballStyle,
                        onClick: this.advancePosition
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