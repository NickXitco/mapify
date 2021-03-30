const SWITCH_STATES = {
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
}

class MultiwaySwitch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: 0,
            states: this.props.states,
        }

        this.advancePosition = this.advancePosition.bind(this);
        this.reportEvent = this.reportEvent.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.setPositionFromClick = this.setPositionFromClick.bind(this);
    }

    advancePosition() {
        const nextPos = (this.state.position + 1) % this.state.states.length;
        this.setState({
            position: nextPos
        });
        this.props.newPosition(nextPos);
    }

    setPositionFromClick(e) {


    }

    showTooltip(e) {

    }

    reportEvent(e) {
        console.log(e.nativeEvent);
    }

    render() {
        const ballStyle = {
            marginLeft: `${Utils.lerp(
                0, 
                (this.state.states.length * 22 * 1.5) - 22, 
                this.state.position / (this.state.states.length - 1)
            )}px`
        }

        const boxStyle = {
            width: `${this.state.states.length * 22 * 1.5}px`
        }

        const stateLabels = this.state.states.map(state =>
            <li className={"stateLabel"}
                key={state.hoverText}
            >
                <img className={"stateImage"} src={state.icon} alt={state.hoverText} title={state.hoverText}/>
            </li>
        );


        return (
            <div className={"switchContainer"}
                 onClick={this.setPositionFromClick}
                 onMouseMove={this.showTooltip}
            >
                <div className={"switchBox"} style={boxStyle}>
                    <div
                        className={"switchBall"}
                        style={ballStyle}
                        onClick={this.advancePosition}
                    />
                    <ul className={"stateLabels"}>
                        {stateLabels}
                    </ul>
                </div>
            </div>
        );
    }

}