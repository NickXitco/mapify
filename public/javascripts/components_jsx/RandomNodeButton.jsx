class RandomNodeButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltip: false,
            hoverState: 0,

            fullyExpanded: false,
        }


        this.expandFully = this.expandFully.bind(this);
    }

    expandFully() {
        if (!this.state.fullyExpanded && this.props.expanded) {
            this.setState({fullyExpanded: true});
        }
    }

    render() {
        let colorStyle = {};
        let borderClassName = "";
        let expandClass = this.props.expanded ? "uiButtonOuterExpand" : this.state.hoverState === 1 ? "randomButtonOuterHover" : "";
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
            <div>
                <div className={`randomButtonOuter uiButtonOuter ${borderClassName} ${expandClass} ${fullyExpanded}`}
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

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="uiButton">
                        <defs>
                            <clipPath id="clip-path">
                                <path className="cls-1" d="M16.49 25.19l-10.42.31L3.62 9.77l10.42-.3 2.45 15.72z"/>
                            </clipPath>
                            <clipPath id="clip-path-2">
                                <path className="cls-1" d="M14.04 9.47l-10.42.3 11.89-2.96 10.42-.31-11.89 2.97z"/>
                            </clipPath>
                            <clipPath id="clip-path-3">
                                <path className="cls-1" d="M25.93 6.5l2.45 15.73-11.89 2.96-2.45-15.72L25.93 6.5z"/>
                            </clipPath>
                        </defs>
                        <g clipPath="url(#clip-path)">
                            <path className="cls-4 uiButtonPath"
                                  d="M13.77 20.34c.16 1.08-.28 2-1 2s-1.44-.85-1.61-1.93.28-2 1-2 1.44.85 1.61 1.94m-.92-5.9c.17 1.09-.28 2-1 2s-1.43-.84-1.6-1.92.27-2 1-2 1.44.83 1.61 1.92m-3 6c.17 1.08-.28 2-1 2s-1.44-.84-1.61-1.92.28-2 1-2 1.44.84 1.61 1.93M9 14.55c.17 1.09-.28 2-1 2s-1.43-.83-1.6-1.92.28-2 1-2 1.45.84 1.62 1.92m-5.4-4.78l2.45 15.72 10.42-.3L14 9.47l-10.42.3"/>
                        </g>
                        <g clipPath="url(#clip-path-2)">
                            <path className="cls-4 uiButtonPath"
                                  d="M15.71 8.77a17.26 17.26 0 01-2.79.41c-.72 0-.64-.13.19-.34a17.15 17.15 0 012.78-.41c.72 0 .64.13-.18.34m5.95-1.49a15.42 15.42 0 01-2.79.41c-.72 0-.64-.12.18-.33A15.42 15.42 0 0121.84 7c.72 0 .64.13-.18.33m-5.58.82a15.3 15.3 0 01-2.79.41c-.72 0-.64-.13.19-.33a15.17 15.17 0 012.79-.41c.71 0 .63.13-.19.33m-5.58.82a16.22 16.22 0 01-2.79.41C7 9.35 7.07 9.2 7.9 9a16.05 16.05 0 012.78-.4c.72 0 .64.12-.18.33m5.95-1.48a16.3 16.3 0 01-2.79.4c-.72 0-.64-.12.18-.33a16.36 16.36 0 012.79-.41c.72 0 .64.13-.18.34m-.93-.63l-11.9 3 10.43-.3 11.89-3-10.42.31"/>
                        </g>
                        <g clipPath="url(#clip-path-3)">
                            <path className="cls-4 uiButtonPath"
                                  d="M21.52 17.81c-.82.21-1.63-.51-1.8-1.59a2 2 0 011.19-2.34c.81-.2 1.62.51 1.79 1.6a2 2 0 01-1.18 2.33m4.42-11.3L14 9.47l2.45 15.72 11.89-3-2.4-15.68"/>
                        </g>
                    </svg>

                    <h4 className="uiButtonTitle">
                        RANDOM ARTIST
                    </h4>
                </div>
            </div>
        )
    }
}