const ICONS = {
    about: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="uiButton" onClick={this.clickHandler}>
            <circle className="uiButtonPath" cx="16.5" cy="24.21" r="2"/>
            <path className="uiButtonPath"
                  d="M19,11.67a2.65,2.65,0,0,0-2.9-2.74,4.14,4.14,0,0,0-3.79,2.25L10,9.34a6.93,6.93,0,0,1,6.3-3.55c3.42,0,5.7,2,5.7,5.3,0,4.75-4,5.19-4,8.62H15.07C15.07,15.4,19,14.59,19,11.67Z"/>
        </svg>
    )
}

class LeftSideButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltip: false,
            hoverState: 0,
            fullyExpanded: false,

            showContents: false,
        }

        this.expandFully = this.expandFully.bind(this);
        this.debugCheck = this.debugCheck.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.transitionEnd = this.transitionEnd.bind(this);
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
        if (!this.props.expanded) {
            this.setState({showContents: true});
        }
        this.props.clickHandler();
        setTimeout(this.expandFully, 400);
        this.setState({hoverState: 0});
    }

    transitionEnd() {
        if (!this.props.expanded) {
            this.setState({showContents: false});
        }
    }

    render() {
        let colorStyle = {};
        let borderClassName = "";
        let expandClass = this.props.expanded ? "uiButtonOuterExpand" : this.state.hoverState === 1 ? "aboutButtonOuterHover" : "";
        let fullyExpanded = this.state.fullyExpanded && this.props.expanded ? "uiButtonOuterExpanded" : "";

        if (this.state.fullyExpanded && !this.props.expanded) {
            this.setState({fullyExpanded: false});
        }

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
            <div className={`uiButtonOuter ${borderClassName} ${expandClass} ${fullyExpanded}`}
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
            >

                {this.props.icon}

                <h4 className="uiButtonTitle">
                    {this.props.heading}
                </h4>
            </div>
        );
    }

}