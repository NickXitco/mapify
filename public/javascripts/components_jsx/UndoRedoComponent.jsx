class UndoRedoComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={"undoRedo"}>
                <button className={"undoRedoButton"}>Undo</button>
                <button className={"undoRedoButton"}>Redo</button>
            </div>
        );
    }

}