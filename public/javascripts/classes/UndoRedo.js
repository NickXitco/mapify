class UndoRedo {

    head;
    tail;
    current;

    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
    }

    reset() {
        this.head = null;
        this.tail = null;
        this.current = null;
    }

    addState(state) {

    }

    canUndo() {
        return false;
    }

    canRedo() {
        return false;
    }

    undo() {
        if (this.canUndo()) {

        }
        return null;
    }

    redo() {
        if (this.canRedo()) {

        }
        return null;
    }

}