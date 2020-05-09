class QuadtreeHelpers {
    static radius(vertices) {
        let r = 0;
        for (const v of vertices) {
            r = max(abs(v.x), abs(v.y), r);
        }
        return r;
    }

    static getVisibleVertices(headQuad, camera) {
        const nodes = headQuad.getNodesInRange({x: camera.x - VIEW_AMOUNT * camera.width,
                y: camera.y + VIEW_AMOUNT * camera.height},
            {x: camera.x + VIEW_AMOUNT * camera.width,
                y: camera.y - VIEW_AMOUNT * camera.height});
        for (const n of nodes) {
            n.visible = true;
        }
        return nodes;
    }

    static drawQuadtree(quadRoot) {
        push();
        rectMode(RADIUS);
        let quads = [];
        quads.push(quadRoot);

        while (quads.length > 0) {
            const q = quads.pop();
            if (q.A !== undefined) quads.push(q.A);
            if (q.B !== undefined) quads.push(q.B);
            if (q.C !== undefined) quads.push(q.C);
            if (q.D !== undefined) quads.push(q.D);

            if (q.n !== null && q.n.visible) stroke("white");
            else continue;

            rect(q.x, -q.y, q.r, q.r);
            push();
            noStroke();
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(q.r);
            text(q.direction, q.x, -q.y);
            pop();
        }
        pop();
    }
}


/**
 * 0.5 is "correct", anything greater will render more outside the viewport,
 * anything less will render only a percentage of the viewport.
 * There are many, many optimizations to be made just in the way that we handle
 * this parameter. However, the total view amount should always be at least 0.5,
 * because we need to be able to render nodes who's own circle rendering falls
 * outside their quad.
 *
 * For example:
 *
 *   We could have the view amount always stay at 0.5, but also declare a
 *   VIEW_OFFSET sort of variable that adds a constant amount of view to the
 *   outside of the frame. We could make that constant equal to the largest
 *   node in the dataset, which would always ensure that every node is in view.
 *
 * @type {number}
 */
const VIEW_AMOUNT = 0.55