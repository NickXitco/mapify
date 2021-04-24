class SettingsButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltip: false,
            hoverState: 0,
            fullyExpanded: false,
        }

        this.expandFully = this.expandFully.bind(this);
        this.debugCheck = this.debugCheck.bind(this);
    }

    expandFully() {
        if (!this.state.fullyExpanded && this.props.expanded) {
            this.setState({fullyExpanded: true});
        }
    }

    componentDidUpdate(prevProps) {
        if (this.state.fullyExpanded && !this.props.expanded) {
            this.setState({fullyExpanded: false});
        }
    }

    debugCheck(e) {
        this.props.flipDebug(e.target.checked);
    }

    render() {
        let colorStyle = {};
        let borderClassName = "";
        let expandClass = this.props.expanded ? "settingsButtonOuterExpand" : this.state.hoverState === 1 ? "uiButtonOuterHover" : "";
        let fullyExpanded = this.state.fullyExpanded && this.props.expanded ? "settingsButtonOuterExpanded" : "";

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

        return (
            <div>
                <div className={`settingsButtonOuter uiButtonOuter ${borderClassName} ${expandClass} ${fullyExpanded}`}
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
                         setTimeout(this.expandFully, 400);
                         this.setState({hoverState: 0});
                     }}

                     onTransitionEnd={this.transitionEnd}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="uiButton">
                        <path d="M16 3.5L3.5 16 16 28.5 28.5 16zm2.25 15.3v-2.32H14.5a.41.41 0 00-.42.41v5a.41.41 0 01-.41.42h-2.92v-8.75a.42.42 0 01.42-.42h6.66a.41.41 0 00.42-.41v-1.92a.42.42 0 01.71-.29l4.29 4.29L19 19.1a.42.42 0 01-.75-.3z"
                              className="uiButtonPath"
                        />
                    </svg>


                    <h4 className="uiButtonTitle">
                        Settings
                    </h4>


                    <div style={{
                        position: 'static',
                        display: 'flex',
                    }}>
                        <div className="shortestPathForm">
                            <input type="checkbox" id="debug" name="debug" value="debug" onInput={this.debugCheck}/>
                            <label htmlFor="debug"> Debug UI</label>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}