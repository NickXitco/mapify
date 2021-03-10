class MultiwaySwitch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            position: 0,
            states: this.props.states
        }

        this.advancePosition = this.advancePosition.bind(this);
    }

    advancePosition() {
        const nextPos = (this.state.position + 1) % this.state.states;
        this.setState({
            position: nextPos
        });
        this.props.newPosition(nextPos);
    }

    render() {
        const ballStyle ={
            marginLeft: `${this.state.position * 22}px`
        }


        return (
            <div className={"switchContainer"}>
                <div className={"switchBox"}>
                    <div
                        className={"switchBall"}
                        style={ballStyle}
                        onClick={this.advancePosition}
                    />
                </div>
            </div>
        );
    }

}