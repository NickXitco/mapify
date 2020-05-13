class Quad {
    A;
    B;
    C;
    D;

    x;
    y;
    r;

    parent;

    renderableNodes;
    n;

    image;

    name;

    leaf;

    loaded;

    constructor(x, y, r, parent, n, name, image) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.parent = parent;
        this.n = n;
        this.name = name;
        this.image = image;

        this.leaf = true;
        this.loaded = false;
        this.renderableNodes = [];
    }

    nodeQuadTreeFromList(nodes) {
        for (const node of nodes) {
            this.insert(node);
        }
    }

    contains(x, y) {
        return  x <= this.x + this.r && x >= this.x - this.r &&
                y >= this.y - this.r && y <= this.y + this.r;
    }

    split() {
        this.leaf = false;
        const half = this.r / 2;
        this.A = new Quad(this.x - half, this.y + half, half, this, null, this.name + "A", null);
        this.B = new Quad(this.x + half, this.y + half, half, this, null, this.name + "B", null);
        this.C = new Quad(this.x - half, this.y - half, half, this, null, this.name + "C", null);
        this.D = new Quad(this.x + half, this.y - half, half, this, null, this.name + "D", null);
    }

    insert(n) {
        if (this.containsRect({x: n.x - n.size / 2, y: n.y + n.size / 2}, {x: n.x + n.size / 2, y: n.y - n.size / 2})) {
            this.renderableNodes.push(n);
            if (n.quad) { return true; }
        }

        if (!this.contains(n.x, n.y)) {
            return false;
        }

        if (this.leaf && this.n === null) {
            this.n = n;
            n.quad = this;
            return true;
        }

        if (this.leaf) {
            const temp = this.n;
            this.n = null;
            this.split();
            this.insert(temp);
        }

        this.A.insert(n);
        this.B.insert(n);
        this.C.insert(n);
        this.D.insert(n);

        return false;
    }

    containsRect(l1, r1) {
        const l2 = {x: this.x - this.r, y: this.y + this.r};
        const r2 = {x: this.x + this.r, y: this.y - this.r};

        return !((l1.x >= r2.x || l2.x >= r1.x) || (l1.y <= r2.y || l2.y <= r1.y));
    }

    splitDown(toLevel) {
        let stack = [];
        stack.push(this);
        while (stack.length > 0) {
            const q = stack.pop();
            if (q.name.length < toLevel && q.leaf) {
                q.split();
                stack.push(q.A);
                stack.push(q.B);
                stack.push(q.C);
                stack.push(q.D);
            }
        }
    }

    async fetchQuad() {
        const response = await fetch('quad/' + this.name); //TODO validation on this response
        const data = await response.json();
        unprocessedResponses.push({quad: this, data: data});
        return true;
    }
}