class SidebarState {

    payload
    prev
    next

    constructor(payload, oldCurrent) {
        this.payload = payload;
        if (oldCurrent === null) {
            this.prev = null;
            this.next = null;
        } else {
            oldCurrent.next = this;
            this.prev = oldCurrent;
            this.next = null;
        }
    }

    canUndo() {
        return this.current !== null && this.current.prev !== null;
    }

    canRedo() {
        return this.current !== null && this.current.next !== null;
    }

    undo() {
        if (this.canUndo()) {
            return this.prev;
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            return this.next;
        }
        return null;
    }

}