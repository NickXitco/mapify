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
        for (const n of this.renderableNodes) {
            this.insert(n);
        }
    }

    insert(n) {
        let stack = [];
        stack.push(this);
        while (stack.length > 0) {
            const q = stack.pop();
            if (q.containsRect({x: n.x - n.size * 0.55, y: n.y + n.size * 0.55}, {x: n.x + n.size * 0.55, y: n.y - n.size * 0.55})) {
                if (n.size / q.r > 0.011 || (q.image === "" && !q.loaded)) {
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

    /**
     * Fetches the database for a particular quad and adds it to the queue of unprocessedResponses. If the quad
     * doesn't exist, the response equals {}, which is handled in processing.
     * @returns {Promise<void>}
     */
    async fetchQuad(unprocessedResponses) {
        const response = await fetch('quad/' + this.name);
        const data = await response.json();
        unprocessedResponses.push({quad: this, data: data});
    }

    deleteSelf(nodeOccurrences, nodeLookup) {
        this.image = null;
        this.loaded = false;
        for (const node of this.renderableNodes) {
            if (node.quad === this) {
                node.quad.n = null;
            }
            if (nodeOccurrences[node.id] === 1) {
                delete nodeLookup[node.id];
            } else if (nodeOccurrences[node.id] > 1) {
                nodeOccurrences[node.id]--;
            }
        }
        this.renderableNodes.clear();
    }
}