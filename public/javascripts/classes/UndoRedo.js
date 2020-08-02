class UndoRedo {

    tail;
    current;

    constructor() {
        this.tail = null;
        this.current = null;
    }

    reset() {
        this.tail = null;
        this.current = null;
    }

    addState(state) {
        let node = {
            state: state,
            prev: null,
            next: null
        }

        if (this.tail !== null) {
            this.tail.next = node;
        }

        node.prev = this.tail;
        this.tail = node;
        this.current = node;

        //TODO add branching by checking if tail === current at some point in this logic (idk where yet)
    }

    canUndo() {
        return this.current !== null && this.current.prev !== null;
    }

    canRedo() {
        return this.current !== null && this.current.next !== null;
    }

    undo() {
        if (this.canUndo()) {
            this.current = this.current.prev;
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            this.current = this.current.next;
        }
        return null;
    }

}