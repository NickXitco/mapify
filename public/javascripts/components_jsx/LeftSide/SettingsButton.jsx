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
        this.clickHandler = this.clickHandler.bind(this);
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

    clickHandler() {
        this.props.clickHandler();
        setTimeout(this.expandFully, 400);
        this.setState({hoverState: 0});
    }

    render() {
        let colorStyle = {};
        let expandClass = this.props.expanded ? "settingsButtonOuterExpand" : this.state.hoverState === 1 ? "settingsButtonOuterHover" : "";
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
            <div className={`uiButtonOuter ${expandClass} ${fullyExpanded}`}
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

                 onTransitionEnd={this.transitionEnd}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="uiButton" onClick={this.clickHandler}>
                    <path className="uiButtonPath" d="M25.72,14.55a1,1,0,0,0-.7-.29H23.54a9,9,0,0,0-.3-1,8.75,8.75,0,0,0-.42-.92L24,11.2a.92.92,0,0,0,.29-.68A.94.94,0,0,0,24,9.83L22.54,8.4a1,1,0,0,0-1.38,0L20.1,9.46A5.56,5.56,0,0,0,19.2,9a8.48,8.48,0,0,0-.95-.37V7a1,1,0,0,0-.29-.7A.94.94,0,0,0,17.27,6h-2a1,1,0,0,0-.69.28,1,1,0,0,0-.29.7V8.46a7.45,7.45,0,0,0-1,.3,9.59,9.59,0,0,0-.91.42L11.2,8a.92.92,0,0,0-.68-.29A.94.94,0,0,0,9.83,8L8.4,9.46a1,1,0,0,0,0,1.38L9.46,11.9a5.56,5.56,0,0,0-.49.9,8.48,8.48,0,0,0-.37.95H7a1,1,0,0,0-.7.29.94.94,0,0,0-.28.69v2a1,1,0,0,0,.28.69,1,1,0,0,0,.7.29H8.46a7.45,7.45,0,0,0,.3,1q.2.48.42.93L8,20.8a.92.92,0,0,0-.29.68.94.94,0,0,0,.29.69l1.43,1.45a1,1,0,0,0,1.38,0l1.06-1.08a5.56,5.56,0,0,0,.9.49,8.48,8.48,0,0,0,.95.37V25a1,1,0,0,0,.29.7.94.94,0,0,0,.69.28h2a1,1,0,0,0,.69-.28,1,1,0,0,0,.29-.7V23.54a7.45,7.45,0,0,0,1-.3q.48-.19.93-.42L20.8,24a.93.93,0,0,0,.69.29.91.91,0,0,0,.68-.29l1.45-1.43a1,1,0,0,0,0-1.38L22.54,20.1a5.56,5.56,0,0,0,.49-.9,8.48,8.48,0,0,0,.37-.95H25a1,1,0,0,0,.7-.29.94.94,0,0,0,.28-.69v-2A1,1,0,0,0,25.72,14.55Zm-6,3a3.93,3.93,0,0,1-2.12,2.12,4,4,0,0,1-3.1,0,3.93,3.93,0,0,1-2.12-2.12,4,4,0,0,1,0-3.1,3.93,3.93,0,0,1,2.12-2.12,4,4,0,0,1,3.1,0,3.93,3.93,0,0,1,2.12,2.12,4,4,0,0,1,0,3.1Z"/>
                </svg>

                <h4 className="uiButtonTitle" onClick={this.clickHandler}>
                    Settings
                </h4>


                <div style={{
                    position: 'static',
                    display: 'flex',
                }}>
                    <div className="settingsItem">
                        <input className={"settingsCheckbox"} type="checkbox" id="debug" name="debug" value="debug" onInput={this.debugCheck}/>
                        <label htmlFor="debug"> Debug UI</label>
                    </div>
                </div>
            </div>
        )
    }
}