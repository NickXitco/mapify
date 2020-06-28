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
        this.renderableNodes = new Set();
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
        let stack = [];
        stack.push(this);
        while (stack.length > 0) {
            const q = stack.pop();
            if (q.containsRect({x: n.x - n.size / 2, y: n.y + n.size / 2}, {x: n.x + n.size / 2, y: n.y - n.size / 2})) {
                if (n.size / q.r > 0.011) {
                    q.renderableNodes.add(n);
                }

                if (q.contains(n.x, n.y) && !n.quad) {
                    if (q.leaf && q.n === null) {
                        q.n = n;
                        n.quad = q;
                        continue;
                    }

                    if (q.leaf) {
                        const temp = q.n;
                        q.n = null;
                        temp.quad = null;
                        q.split();
                        q.insert(temp);
                        for (const n of q.renderableNodes) {
                            q.insert(n);
                        }
                    }
                }

                if (!q.leaf) {
                    stack.push(q.A);
                    stack.push(q.B);
                    stack.push(q.C);
                    stack.push(q.D);
                }
            }
        }
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

    deleteSelf(nodeOccurences, nodeLookup) {
        this.image = null;
        this.loaded = false;
        for (const node of this.renderableNodes) {
            if (node.quad === this) {
                node.quad.n = null;
            }
            if (nodeOccurences[node.id] === 1) {
                delete nodeLookup[node.id];
            } else if (nodeOccurences[node.id] > 1) {
                nodeOccurences[node.id]--;
            }
        }
        this.renderableNodes.clear();
    }
}