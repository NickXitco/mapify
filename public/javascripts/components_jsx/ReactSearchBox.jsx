class ReactSearchBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: "",
            artistSuggestions: [],
            genreSuggestions: [],
        }

        this.requestCounter = 0;
        this.highestReceivedResponse = -1;

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
        this.setState({artistSuggestions: this.props.createNodesFromSuggestions(data.artists), genreSuggestions: data.genres});
    }

    processSuggestionClick(artist) {
        this.props.loadArtistFromUI(artist);
        this.resetState();
    }

    processGenreSuggestionClick(genre) {
        this.props.loadGenreFromSearch(genre.name);
        this.resetState();
    }

    sendSubmitIfEnter(e) {
        if (e.key === "Enter") {
            this.props.loadArtistFromSearch(e.target.value);
            this.resetState();
        }
    }

    resetState() {
        this.setState({value: "", artistSuggestions: [], genreSuggestions: []});
    }

    render() {
        if (this.props.clearSearch) {
            this.resetState();
            this.props.flipClearSearch();
        }

        if (this.state.value.length === 0 && (this.state.artistSuggestions.length > 0 || this.state.genreSuggestions.length > 0)) {
            this.resetState();
        }

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

        let artistHeader = this.state.artistSuggestions.length > 0 ? (<p className="searchHeader">Artists</p>) : null;
        let genreHeader = this.state.genreSuggestions.length > 0 ? (<p className="searchHeader">Genres</p>) : null;
        let artistsList = null;
        let genresList = null;

        /**
         *
         *                  Artist Suggestions
         *                    0    |   > 0
         *               |-------------------|
         * Genre       0 | no     | no genre |
         * Suggestions   |results | header   |
         *              -|--------+----------|
         *           > 0 |no artist| normal  |
         *               |header   |         |
         *               |-------------------|
         */

        if (this.state.artistSuggestions.length === 0 && this.state.genreSuggestions.length === 0 && this.state.value.length > 0) {
            artistsList = (
                <ul className={"suggestions"}>
                    <li className={"suggestion"}
                        key={"noResults"}
                    >
                        <p className={"suggestedArtist"}>
                            No Results Found.
                        </p>
                    </li>
                </ul>
            )
        } else {
            if (this.state.artistSuggestions.length > 0) {
                artistsList = (
                    <ul className={"suggestions"}>
                        {this.state.artistSuggestions.map(artist =>
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
                        )}
                    </ul>
                );
            }

            if (this.state.genreSuggestions.length > 0) {
                genresList = (
                    <ul className={"suggestions"}>
                        {this.state.genreSuggestions.map(genre =>
                            <li className={"suggestion"}
                                key={genre.name.toString()}
                            >
                                <p className={"suggestedArtist"}
                                   onClick={() => {this.processGenreSuggestionClick(genre)}}
                                >
                                    {genre.name.toString().replace(/\b\w+/g,function(s){return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();})}
                                </p>
                            </li>
                        )}
                    </ul>
                )
            }
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
                           placeholder="search for an artist/genre..."
                           onInput={this.processInput}
                           onKeyDown={this.sendSubmitIfEnter}
                           value={this.state.value}
                    />
                </div>
                {artistHeader}
                {artistsList}
                {genreHeader}
                {genresList}
            </div>
        )
    }

}