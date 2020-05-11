class Quad {
    A;
    B;
    C;
    D;

    x;
    y;
    r;

    parent;

    nodes;
    n;

    image;

    name;

    constructor(x, y, r, parent, n, name, image) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.parent = parent;
        this.n = n;
        this.name = name;
        this.image = image;
    }

    contains(x, y) {
        return  x <= this.x + this.r && x >= this.x - this.r &&
                y >= this.y - this.r && y <= this.y + this.r;
    }

    split() {
        const half = this.r / 2;
        this.A = new Quad(this.x - half, this.y + half, half, this, null, this.name + "A", null);
        this.B = new Quad(this.x + half, this.y + half, half, this, null, this.name + "B", null);
        this.C = new Quad(this.x - half, this.y - half, half, this, null, this.name + "C", null);
        this.D = new Quad(this.x + half, this.y - half, half, this, null, this.name + "D", null);
    }

    insert(n) {
        if (!this.contains(n.x, n.y)) {
            return false;
        }

        if (this.isLeaf() && this.n === null) {
            this.n = n;
            n.quad = this;
            return true;
        }

        if (this.isLeaf()) {
            const temp = this.n;
            this.n = null;
            this.split();
            this.insert(temp);
        }

        if (this.A.insert(n)) return true;
        if (this.B.insert(n)) return true;
        if (this.C.insert(n)) return true;
        if (this.D.insert(n)) return true;

        return false;
    }

    containsRect(l1, r1) {
        const l2 = {x: this.x - this.r, y: this.y + this.r};
        const r2 = {x: this.x + this.r, y: this.y - this.r};

        return !((l1.x >= r2.x || l2.x >= r1.x) || (l1.y <= r2.y || l2.y <= r1.y));
    }

    isLeaf() {
        return this.A === undefined;
    }


    getNodes() {
        let nodes = [];
        let stack = [];
        stack.push(this);
        while (stack.length > 0) {
            const q = stack.pop();
            if (q.isLeaf() && q.n != null) {
                nodes.push(q.n);
            } else if (!q.isLeaf()) {
                stack.push(q.A);
                stack.push(q.B);
                stack.push(q.C);
                stack.push(q.D);
            }
        }
        return nodes;
    }

    getNodesInRange(l1, r1) {
        let nodes = [];
        let stack = [];
        stack.push(this);
        while (stack.length > 0) {
            const q = stack.pop();
            if (!q.containsRect(l1, r1)) continue;
            if (q.isLeaf() && q.n != null) {
                nodes.push(q.n);
            } else if (!q.isLeaf()) {
                stack.push(q.A);
                stack.push(q.B);
                stack.push(q.C);
                stack.push(q.D);
            }
        }
        return nodes;
    }
}