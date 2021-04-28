class MultiwaySwitchButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            switchState: this.props.switchState,
            position: this.props.position,
            showTooltip: false,
        }

        this.setHover = this.setHover.bind(this);
        this.unsetHover = this.unsetHover.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
    }

    setHover() {
        this.setState({showTooltip: true});
    }

    unsetHover() {
        this.setState({showTooltip: false});
    }

    clickHandler() {
        this.props.click(this.state.position);
    }

    render() {
        const tooltipStyle = {
            visibility: this.state.showTooltip ? 'visible' : 'hidden'
        }

        let arrow = ''
        if (this.state.position === this.props.currentPos && this.state.switchState !== SWITCH_STATES.RANDOM) {
            arrow = this.props.reversed ? ' ▼' : ' ▲';
        }

        return (
            <div className={"stateLabel"}
                 onMouseEnter={this.setHover}
                 onMouseLeave={this.unsetHover}
                 onClick={this.clickHandler}
            >
                <div className={"tooltip"} style={tooltipStyle}>
                    <p>{this.state.switchState.hoverText}{arrow}</p>
                </div>
                <img className={"stateImage"} src={this.state.switchState.icon} alt={this.state.switchState.hoverText}/>
            </div>
        );
    }
}