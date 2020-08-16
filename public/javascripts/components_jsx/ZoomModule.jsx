class ZoomModule extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let colorStyle;
        const color = this.props.colorant ? this.props.colorant.colorToString() : 'white';

        colorStyle = {
            borderColor: color,
            boxShadow: `0 0 10px 0 ${color}, inset 0 0 5px 0 ${color}`
        }

        return (
            <div className="zoomModuleDiv">
                <div className="zoomModuleButton"
                     style={colorStyle}
                     onClick={this.props.zoomCameraIn}

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
                >
                    <p>+</p>
                </div>
                <div className="zoomModuleButton"
                     style={colorStyle}
                     onClick={this.props.resetCamera}

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
                >
                    <p>⌂</p>
                </div>
                <div className="zoomModuleButton"
                     style={colorStyle}
                     onClick={this.props.zoomCameraOut}

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
                >
                    <p>-</p>
                </div>
            </div>
        )
    }
}