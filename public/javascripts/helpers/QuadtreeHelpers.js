function processOne() {
    if (unprocessedResponses.length > 0) {
        const r = unprocessedResponses.pop();
        const q = r.quad;

        /* TODO
            Implement some sort of system that loads quads that we can see first
        if (!camera.contains(q)) {
            unprocessedResponses.push(r);
            return;
        }
         */

        if (Object.keys(r.data).length === 0) {
            q.loaded = true;
            loadingQuads.delete(q);
            return;
        }

        if (q.leaf && !r.data.leaf) {
            q.split();
        }
        
        for (const node of r.data.nodes) {
            createNewNode(node);
        }

        if (r.data.image !== "") {
            loadImage('data:image/png;base64, ' + r.data.image, (img) => {
                q.image = img;
                q.loaded = true;
                loadingQuads.delete(q);
            });
        } else {
            q.loaded = true;
            loadingQuads.delete(q);
        }

        /*
        let evicted = quadCache.insert(q, q.name);
        if (evicted) {
            evicted.deleteSelf(nodeOccurences, nodeLookup);
        }
         */
    }
}


const TILE_WIDTH = 1024;
function bubbleAddQuad(q, quads) {
    while (!q.loaded && q.name !== "A") {
        q = q.parent;
    }
    quads.add(q);
    if (!q.image) {
        while (!q.image && q.name !== "A") {
            q = q.parent;
        }
        quads.add(q);
    }
}

function drawOnscreenQuads(quadHead, camera) {
    let quads = new Set();
    let stack = [];
    stack.push(quadHead);
    const scale = camera.getZoomFactor().x;
    while (stack.length > 0) {
        let q = stack.pop();
        if (camera.contains(q)) {
            if (!q.loaded) {
                if (!loadingQuads.has(q) && !unloadedQuads.has(q)) {
                    unloadedQuads.add(q);
                    unloadedQuadsPriorityQueue.push(q);
                }
            }
            if ((q.r * 2 * scale) / TILE_WIDTH > 1) {
                if (q.leaf) {
                    bubbleAddQuad(q, quads);
                } else {
                    stack.push(q.A);
                    stack.push(q.B);
                    stack.push(q.C);
                    stack.push(q.D);
                }
            } else if ((q.r * 2 * scale) / TILE_WIDTH >= 0.5) {
                bubbleAddQuad(q, quads);
            }
        }
    }

    createTimingEvent("Visible Quads Finding");

    const sortedQuads = [...quads].sort((a, b) => a.name.length - b.name.length);
    for (const q of sortedQuads) {

        /*
        let evicted = quadCache.insert(q, q.name);
        if (evicted) {
            evicted.deleteSelf(nodeOccurences, nodeLookup);
        }
         */



        if (q.image) {

            image(q.image, q.x - q.r, -(q.y + q.r), q.r * 2, q.r * 2, 0, 0);

        } else {
            push();
            noFill();
            for (const n of q.renderableNodes) {
                stroke(n.color);
                strokeWeight(n.size / 5);
                circle(n.x, -n.y, n.size);
            }
            pop();
        }
        //debugText(q);
    }

    function debugText(q) {
        textSize(q.r / 20);
        fill('green');
        noStroke();
        textAlign(LEFT, TOP);
        text('Displayed Size: (' + q.r * 2 * camera.getZoomFactor().x + ', ' + q.r * 2 * camera.getZoomFactor().y + ')', q.x - q.r, -(q.y + q.r * 0.95));
        text('Number of Nodes Inside: ' + q.renderableNodes.size, q.x - q.r, -(q.y + q.r * 0.90));
        if (q.image) {
            text('Actual Size: (' + q.image.width + ', ' + q.image.height + ')', q.x - q.r, -(q.y + q.r));
        }


        fill('white');
        noStroke();
        textAlign(CENTER, CENTER);
        text(q.name, q.x, -q.y);
        textSize(q.r / 20);
        noFill();
        stroke('white');
        strokeWeight(q.r / 100);
        rect(q.x, -q.y, q.r, q.r);
    }

    createTimingEvent("Visible Quads Drawing");
}