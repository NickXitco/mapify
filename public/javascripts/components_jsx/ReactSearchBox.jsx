class ReactSearchBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.artist) {
            return null;
        }

        const color = {
            borderColor: this.props.artist.colorToString(),
            boxShadow: "0 0 6px 0.5px " + this.props.artist.colorToString()
        }

        return (
            <div className={"searchBox"}>
                <div className={"searchBar"}>
                    <input className={"searchInput"}
                           style={color}
                           type="text"
                           placeholder="search for an artist..."
                           onInput={(e) => {this.props.processSearchInputChange(e.target.value)}}
                    />
                </div>
                <ul className={"suggestions"}>
                </ul>
            </div>
        )
    }

}