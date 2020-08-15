class ShortestPathDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltip: false,
            hoverState: 0,

            startValue: "",
            endValue: "",
            startSuggestions: [],
            endSuggestions: [],

            startArtist: null,
            endArtist: null,
        }

        this.requestCounter = 0;
        this.highestReceivedResponse = 0;

        this.processInput = this.processInput.bind(this);
        this.processSuggestions = this.processSuggestions.bind(this);
        this.processSuggestionClick = this.processSuggestionClick.bind(this);

        this.sendSubmitIfEnter = this.sendSubmitIfEnter.bind(this);
        this.getPath = this.getPath.bind(this);
    }

    processInput(e, start) {
        const currentInput = e.target.value.valueOf().toString();

        if (start) {
            this.setState({startValue: currentInput, startArtist: null});
        } else {
            this.setState({endValue: currentInput, endArtist: null});
        }

        const url = "artistSearch/" + encodeURIComponent(currentInput);

        const currentCount = this.requestCounter.valueOf();

        this.requestCounter++;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                //Only accept a response if it's the latest request we've gotten back
                if (currentCount > this.highestReceivedResponse) {
                    this.highestReceivedResponse = currentCount;
                    this.processSuggestions(data, start);
                }
            });
    }

    processSuggestions(data, start) {
        if (start) {
            this.setState({startSuggestions: this.props.createNodesFromSuggestions(data.artists)});
        } else {
            this.setState({endSuggestions: this.props.createNodesFromSuggestions(data.artists)});
        }
    }

    processSuggestionClick(artist, start) {
        if (start) {
            this.setState({startValue: artist.name, startArtist: artist, startSuggestions: []});
        } else {
            this.setState({endValue: artist.name, endArtist: artist, endSuggestions: []});
        }
        this.props.updateHoveredArtist(null);
    }



    sendSubmitIfEnter(e) {
        if (e.key === "Enter") {
            this.getPath();
        }
    }

    getPath() {
        const start = this.state.startArtist ? this.state.startArtist : this.state.startSuggestions.length > 0 ? this.state.startSuggestions[0] : null;
        const end = this.state.endArtist ? this.state.endArtist : this.state.endSuggestions.length > 0 ? this.state.endSuggestions[0] : null;
        if (start && end) {
            fetch(`path/${start.id}/${end.id}`)
                .then(res => res.json())
                .then(path => this.props.updatePath(path));
        }
    }

    resetState(start) {
        if (start) {
            this.setState({startValue: "", startSuggestions: []});
        } else {
            this.setState({endValue: "", endSuggestions: []});
        }
    }

    render() {
        if (this.state.startValue.length === 0 && this.state.startSuggestions.length > 0) {
            this.resetState(true);
        }

        if (this.state.endValue.length === 0 && this.state.endSuggestions.length > 0) {
            this.resetState(false);
        }


        let colorStyle = {};
        let borderClassName = "";
        let expandClass = this.props.expanded ? "uiButtonOuterExpand" : this.state.hoverState === 1 ? "uiButtonOuterHover" : "";

        const color = this.props.colorant ? this.props.colorant.colorToString() : 'white';

        switch (this.state.hoverState) {
            case 0:
                colorStyle = {
                    borderColor: color,
                    boxShadow: `0 0 10px 0 ${color}, inset 0 0 5px 0 ${color}`
                }
                break;
            case 1:
                colorStyle = {
                    borderColor: color,
                    boxShadow: `0 0 15px 0 ${color}, inset 0 0 10px 0 ${color}`
                }
                break;
        }

        let startArtistsList, endArtistsList;

        if (this.state.startSuggestions.length > 0) {
            startArtistsList = (
                <ul className={"suggestions"}>
                    {this.state.startSuggestions.map(artist =>
                        <li className={"suggestion"}
                            key={artist.id.toString()}
                        >
                            <p className={"suggestedArtist"}
                               onClick={() => {this.processSuggestionClick(artist, true)}}
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

        if (this.state.endSuggestions.length > 0) {
            endArtistsList = (
                <ul className={"suggestions"}>
                    {this.state.endSuggestions.map(artist =>
                        <li className={"suggestion"}
                            key={artist.id.toString()}
                        >
                            <p className={"suggestedArtist"}
                               onClick={() => {this.processSuggestionClick(artist, false)}}
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

        return (
            <div>
                <div className={`uiButtonOuter ${borderClassName} ${expandClass}`}
                     style={colorStyle}

                     onMouseEnter={() => {
                         if (!this.props.expanded) {
                             this.setState({hoverState: 1});
                         }
                         this.props.updateHoverFlag(true);
                     }}

                     onMouseLeave={() => {
                         this.setState({hoverState: 0});
                         this.props.updateHoverFlag(false);
                     }}

                     onClick={() => {
                         this.props.clickHandler();
                         this.setState({hoverState: 0});
                     }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="uiButton">
                        <path d="M16 3.5L3.5 16 16 28.5 28.5 16zm2.25 15.3v-2.32H14.5a.41.41 0 00-.42.41v5a.41.41 0 01-.41.42h-2.92v-8.75a.42.42 0 01.42-.42h6.66a.41.41 0 00.42-.41v-1.92a.42.42 0 01.71-.29l4.29 4.29L19 19.1a.42.42 0 01-.75-.3z"
                              className="uiButtonPath"
                        />
                    </svg>


                    <h4 className="uiButtonTitle">
                        SHORTEST PATH
                    </h4>

                    <div className="shortestPathForm">
                        <label>START</label>
                        <div className={"shortestPathSearch"}>
                            <input className={`searchInput ${borderClassName}`}
                                   style={colorStyle}
                                   type="text"
                                   placeholder="search for an artist"
                                   onInput={(e) => {this.processInput(e, true)}}
                                   onKeyDown={(e) => {this.sendSubmitIfEnter(e, true)}}
                                   value={this.state.startValue}
                            />
                        </div>
                        {startArtistsList}
                        <label>END</label>
                        <div className={"shortestPathSearch"}>
                            <input className={`searchInput ${borderClassName}`}
                                   style={colorStyle}
                                   type="text"
                                   placeholder="search for an artist"
                                   onInput={(e) => {this.processInput(e, false)}}
                                   onKeyDown={(e) => {this.sendSubmitIfEnter(e, false)}}
                                   value={this.state.endValue}
                            />
                        </div>
                        {endArtistsList}
                    </div>

                    <button className="mapifyButton"
                            onClick={this.getPath}
                    >
                        GO
                    </button>

                </div>
            </div>
        )
    }
}