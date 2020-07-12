function processOne(quadHead, nodeLookup) {
    if (unprocessedResponses.length === 0) {
        return;
    }

    let i = 0;
    for (const response of unprocessedResponses) {
        const q = response.quad;

        if (camera.contains(q)) {
            process(response, q, quadHead, nodeLookup);
            unprocessedResponses.splice(i, 1);
            return;
        }
        i++;
    }

    const r = unprocessedResponses.pop();
    const q = r.quad;
    process(r, q, quadHead, nodeLookup);
}

function process(r, q, quadHead, nodeLookup) {
    if (Object.keys(r.data).length === 0) {
        q.loaded = true;
        loadingQuads.delete(q);
        return;
    }

    if (q.leaf && !r.data.leaf) {
        q.split();
    }

    for (const node of r.data.nodes) {
        createNewNode(node, quadHead, nodeLookup);
    }

    if (r.data.image !== "") {
        p.loadImage('data:image/png;base64, ' + r.data.image, (img) => {
            q.image = img;
            q.loaded = true;
            loadingQuads.delete(q);
        });
    } else {
        q.loaded = true;
        loadingQuads.delete(q);
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
        if (q.image) {
            p.image(q.image, q.x - q.r, -(q.y + q.r), q.r * 2, q.r * 2, 0, 0);
        } else {
            p.push();
            p.noFill();
            for (const n of q.renderableNodes) {
                p.stroke(n.color);
                p.strokeWeight(n.size / 5);
                p.circle(n.x, -n.y, n.size);
            }
            p.pop();
        }
        //debugText(q);
    }

    if (hoveredArtist) {
        p.push();
        p.noStroke();
        hoveredArtist.color.setAlpha(127);
        p.fill(hoveredArtist.color);
        hoveredArtist.color.setAlpha(255);
        p.circle(hoveredArtist.x, -hoveredArtist.y, hoveredArtist.size);
        p.pop();
    }


    function debugText(q) {
        p.textSize(q.r / 20);
        p.fill('green');
        p.noStroke();
        p.textAlign(LEFT, TOP);
        p.text('Displayed Size: (' + q.r * 2 * camera.getZoomFactor().x + ', ' + q.r * 2 * camera.getZoomFactor().y + ')', q.x - q.r, -(q.y + q.r * 0.95));
        p.text('Number of Nodes Inside: ' + q.renderableNodes.size, q.x - q.r, -(q.y + q.r * 0.90));
        if (q.image) {
            p.text('Actual Size: (' + q.image.width + ', ' + q.image.height + ')', q.x - q.r, -(q.y + q.r));
        }


        p.fill('white');
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.text(q.name, q.x, -q.y);
        p.textSize(q.r / 20);
        p.noFill();
        p.stroke('white');
        p.strokeWeight(q.r / 100);
        p.rect(q.x, -q.y, q.r, q.r);
    }

    createTimingEvent("Visible Quads Drawing");
}