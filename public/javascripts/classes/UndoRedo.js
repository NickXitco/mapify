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
        return this.current !== null && this.current.prev !== null;

    }

    canRedo() {
        return this.current !== null && this.current.next !== null;
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