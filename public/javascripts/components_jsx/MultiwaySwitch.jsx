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

        this.setPositionFromClick = this.setPositionFromClick.bind(this);
    }

    setPositionFromClick(pos) {
        this.setState({position: pos});
        this.props.newPosition(pos);
    }

    render() {
        const ballStyle = {
            marginLeft: `${Utils.lerp(
                0, 
                (this.state.states.length * 22 * 1.5) - 22, 
                this.state.position / (this.state.states.length - 1)
            )}px`,
            boxShadow: `${this.props.color} 0 0 5px 3px, inset black 0 0 5px 0`
        }

        const boxStyle = {
            width: `${this.state.states.length * 22 * 1.5}px`
        }

        const listItemStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px'
        }

        const stateLabels = this.state.states.map((state, i) =>
            <li key={i} style={listItemStyle}>
                <MultiwaySwitchButton
                    switchState={state}
                    position={i}
                    click={this.setPositionFromClick}
                    currentPos={this.state.position}
                    reversed={this.props.reversed}
                />
            </li>
        );


        return (
            <div className={"switchContainer"}>
                <div className={"switchBox"} style={boxStyle}>
                    <div
                        className={"switchBall"}
                        style={ballStyle}
                    />
                    <ul className={"stateLabels"}>
                        {stateLabels}
                    </ul>
                </div>
            </div>
        );
    }

}