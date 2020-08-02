class UndoRedoComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        console.log(this.props.sidebarState);

        const undoClass = "undoRedoButton " + (this.props.sidebarState && this.props.sidebarState.canUndo() ? "undoRedoClickable" : "undoRedoUnclickable");
        const redoClass = "undoRedoButton " + (this.props.sidebarState && this.props.sidebarState.canRedo() ? "undoRedoClickable" : "undoRedoUnclickable");

        return (
            <div className={"undoRedo"}>
                <button className={undoClass} onClick={this.props.undoSidebarState}>Undo</button>
                <button className={redoClass} onClick={this.props.redoSidebarState}>Redo</button>
            </div>
        );
    }

}