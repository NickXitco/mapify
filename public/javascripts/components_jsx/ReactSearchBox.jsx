class ReactSearchBox extends React.Component {
    constructor(props) {
        super(props);

        this.sendSubmitIfEnter = this.sendSubmitIfEnter.bind(this);
    }

    sendSubmitIfEnter(e) {
        if (e.key === "Enter") {
            this.props.processSearchSubmit(e.target.value);
        }
    }

    render() {
        if (!this.props.artist) {
            return null;
        }

        const color = {
            borderColor: this.props.artist.colorToString(),
            boxShadow: "0 0 6px 0.5px " + this.props.artist.colorToString()
        }

        const results = this.props.results.map(artist =>
            <li className={"suggestion"}
                key={artist.id.toString()}
                onClick={() => {this.props.updateClickedArtist(artist)}}
            >
                <div className={"suggestedArtist"}>
                    <p>
                        {artist.name.toString()}
                    </p>
                </div>
            </li>
        );

        return (
            <div className={"searchBox"}>
                <div className={"searchBar"}>
                    <input className={"searchInput"}
                           style={color}
                           type="text"
                           placeholder="search for an artist..."
                           onInput={(e) => {this.props.processSearchInputChange(e.target.value)}}
                           onKeyDown={this.sendSubmitIfEnter}
                    />
                </div>
                <ul className={"suggestions"}>
                    {results}
                </ul>
            </div>
        )
    }

}