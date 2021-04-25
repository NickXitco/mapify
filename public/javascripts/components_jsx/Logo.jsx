class Logo extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const h2Style = {
            color: this.props.colorant.colorToString()
        }

        const h1Style = {
            textShadow: `0px 0px 5px ${this.props.colorant.colorToString()}`
        }

        return (
            <div className={"logoBox"}>
                <h2 className={"logoh2"} style={h2Style}>the artist</h2>
                <h1 className={"logoh1"} style={h1Style}>observatory</h1>
            </div>
        )
    }
}