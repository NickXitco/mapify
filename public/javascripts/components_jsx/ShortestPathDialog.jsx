class ShortestPathDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            tooltip: false
        }
    }

    render() {
        let colorStyle = {};
        let borderClassName = "";
        let expandClass = this.state.expanded ? "uiButtonOuterExpand" : "";

        if (this.props.colorant) {
            colorStyle = {
                borderColor: this.props.colorant.colorToString(),
                boxShadow: `0 0 10px 0 ${this.props.colorant.colorToString()}, inset 0 0 5px 0 ${this.props.colorant.colorToString()}`
            }
        } else {
            borderClassName = "searchBox-white";
        }

        return (
            <div className={`uiButtonOuter ${borderClassName} ${expandClass}`}
                 style={colorStyle}
                 onMouseEnter={() => {this.setState({expanded: true})}}
                 onMouseLeave={() => {this.setState({expanded: false})}}
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
                               onInput={this.processInput}
                               onKeyDown={this.sendSubmitIfEnter}
                               value={this.state.value}
                        />
                    </div>
                    <label>FINISH</label>
                    <div className={"shortestPathSearch"}>
                        <input className={`searchInput ${borderClassName}`}
                               style={colorStyle}
                               type="text"
                               placeholder="search for an artist"
                               onInput={this.processInput}
                               onKeyDown={this.sendSubmitIfEnter}
                               value={this.state.value}
                        />
                    </div>
                </div>

                <button>Go</button>
            </div>
        )
    }
}