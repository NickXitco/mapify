class ReactSearchBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: "",
            suggestions: []
        }

        this.requestCounter = 0;
        this.highestReceivedResponse = 0;

        this.processInput = this.processInput.bind(this);
        this.processSuggestions = this.processSuggestions.bind(this);
        this.processSuggestionClick = this.processSuggestionClick.bind(this);

        this.resetState = this.resetState.bind(this);

        this.sendSubmitIfEnter = this.sendSubmitIfEnter.bind(this);
    }

    processInput(e) {
        const currentInput = e.target.value.valueOf().toString();
        this.setState({value: currentInput});
        const url = "artistSearch/" + encodeURIComponent(currentInput);

        const currentCount = this.requestCounter.valueOf();

        this.requestCounter++;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                //Only accept a response if it's the latest request we've gotten back
                if (currentCount > this.highestReceivedResponse) {
                    this.highestReceivedResponse = currentCount;
                    this.processSuggestions(data);
                }
            });
    }

    processSuggestions(data) {
        this.setState({suggestions: this.props.createNodesFromSuggestions(data)});
    }

    processSuggestionClick(artist) {
        this.props.loadArtistFromUI(artist);
        this.resetState();
    }

    sendSubmitIfEnter(e) {
        if (e.key === "Enter") {
            this.props.loadArtistFromSearch(e.target.value);
            this.resetState();
        }
    }

    resetState() {
        this.setState({value: "", suggestions: []});
    }

    render() {
        let colorStyle = {};
        let borderClassName = "";
        if (this.props.colorant) {
            colorStyle = {
                borderColor: this.props.colorant.colorToString(),
                boxShadow: "0 0 6px 0.5px " + this.props.colorant.colorToString()
            }
        } else {
            borderClassName = "searchBox-white";
        }

        let suggestions = this.state.suggestions.map(artist =>
            <li className={"suggestion"}
                key={artist.id.toString()}
            >
                <p className={"suggestedArtist"}
                   onClick={() => {this.processSuggestionClick(artist)}}
                   onMouseEnter={() => {this.props.updateHoveredArtist(artist)}}
                   onMouseLeave={() => {this.props.updateHoveredArtist(null)}}
                >
                    {artist.name.toString()}
                </p>
            </li>
        );

        if (suggestions.length === 0 && this.state.value.length > 0) {
            suggestions.push(
                <li className={"suggestion"}
                    key={"noResults"}
                >
                        <p className={"suggestedArtist"}>
                            No Results Found.
                        </p>
                </li>
            )
        }

        return (
            <div className={"searchBox"}
                 onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                 onMouseLeave={() => {this.props.updateHoverFlag(false)}}
            >
                <div className={"searchBar"}>
                    <input className={`searchInput ${borderClassName}`}
                           style={colorStyle}
                           type="text"
                           placeholder="search for an artist..."
                           onInput={this.processInput}
                           onKeyDown={this.sendSubmitIfEnter}
                           value={this.state.value}
                    />
                </div>
                <ul className={"suggestions"}>
                    {suggestions}
                </ul>
            </div>
        )
    }

}