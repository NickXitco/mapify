class UndoRedoComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            undoState: 0,
            redoState: 0
        }


        this.lastState = null;
    }

    render() {

        const undoClass = "undoRedoButton " + (this.props.sidebarState && this.props.sidebarState.canUndo() ? "undoRedoClickable" : "undoRedoUnclickable");
        const redoClass = "undoRedoButton " + (this.props.sidebarState && this.props.sidebarState.canRedo() ? "undoRedoClickable" : "undoRedoUnclickable");

        const color = ColorUtilities.rgbToString(this.props.color[0], this.props.color[1], this.props.color[2]);
        const darkerColor = ColorUtilities.rgbToString(this.props.color[0] / 2, this.props.color[1] / 2, this.props.color[2] / 2);

        const hoverStyle = {
            boxShadow: `0 0 20px 0 ${color}`
        }

        const activeStyle = {
            boxShadow: `0 0 20px 0 ${color}, inset 0 0 20px 0 ${darkerColor}`
        }

        const defaultStyle = {
            boxShadow: `0 0 10px 0 ${color}`
        }

        let undoStyle;
        let redoStyle;

        switch (this.state.undoState) {
            case 0:
                undoStyle = this.props.sidebarState && this.props.sidebarState.canUndo() ? defaultStyle : {}
                break;
            case 1:
                undoStyle = this.props.sidebarState && this.props.sidebarState.canUndo() ? hoverStyle : {}
                break;
            case 2:
                undoStyle = this.props.sidebarState && this.props.sidebarState.canUndo() ? activeStyle : {}
        }

        switch (this.state.redoState) {
            case 0:
                redoStyle = this.props.sidebarState && this.props.sidebarState.canRedo() ? defaultStyle : {}
                break;
            case 1:
                redoStyle = this.props.sidebarState && this.props.sidebarState.canRedo() ? hoverStyle : {}
                break;
            case 2:
                redoStyle = this.props.sidebarState && this.props.sidebarState.canRedo() ? activeStyle : {}
                break;
        }


        if (this.lastState !== this.props.sidebarState) {
            this.lastState = this.props.sidebarState;
            console.log(this.props.sidebarState);
        }


        return (
            <div className={"undoRedo"}>
                <button className={undoClass}
                        style={undoStyle}
                        onMouseEnter={() => {this.setState({undoState: 1})}}
                        onMouseLeave={() => {this.setState({undoState: 0})}}
                        onMouseDown={() => {this.setState({undoState: 2})}}
                        onMouseUp={() => {this.setState({undoState: 1})}}
                        onClick={this.props.undoSidebarState}
                >
                    {"<"}
                </button>
                <button className={redoClass}
                        style={redoStyle}
                        onMouseEnter={() => {this.setState({redoState: 1})}}
                        onMouseLeave={() => {this.setState({redoState: 0})}}
                        onMouseDown={() => {this.setState({redoState: 2})}}
                        onMouseUp={() => {this.setState({redoState: 1})}}
                        onClick={this.props.redoSidebarState}
                >
                    {">"}
                </button>
            </div>
        );
    }

}