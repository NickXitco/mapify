function processOne(camera, quadHead, nodeLookup, loadingQuads, unprocessedResponses) {
    if (unprocessedResponses.length === 0) {
        return;
    }

    let i = 0;
    for (const response of unprocessedResponses) {
        const q = response.quad;

        if (camera.contains(q)) {
            process(response, q, quadHead, nodeLookup, loadingQuads);
            unprocessedResponses.splice(i, 1);
            return;
        }
        i++;
    }

    const r = unprocessedResponses.pop();
    const q = r.quad;
    process(r, q, quadHead, nodeLookup, loadingQuads);
}

function process(r, q, quadHead, nodeLookup, loadingQuads) {
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
        const loader = new PIXI.Loader();
        const uri = `data:image/png;base64, ${r.data.image}`;

        //TODO check if an all black image already is loaded
        loader.add(uri);
        loader.onComplete.add(() => {
            q.image = loader.resources[uri].texture;
            q.image.baseTexture.mipmap = false;
            q.loaded = true;
            loadingQuads.delete(q);
        });
        loader.load();
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

function drawOnscreenQuads(canvas, realNodesContainer, quadHead, camera, hoveredArtist, loadingQuads, unloadedQuads, unloadedQuadsPriorityQueue, debug) {
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

    Debug.createTimingEvent("Visible Quads Finding");

    const sortedQuads = [...quads].sort((a, b) => a.name.length - b.name.length);
    //TODO if these are the same quads as currently rendering, don't rerender

    canvas.removeChildren();
    let i = 0;
    let nodesToDraw = new Set();
    for (const q of sortedQuads) {
        if (q.image) {
            //If the quad has an image, show it
            const sprite = new PIXI.Sprite(q.image);
            sprite.anchor.set(0.5);
            sprite.x = q.x;
            sprite.y = -q.y;
            sprite.width = q.r * 2;
            sprite.height = q.r * 2;
            canvas.addChild(sprite);
        } else {
            // Otherwise draw the nodes ourselves
            for (const v of q.renderableNodes) {
                nodesToDraw.add(v);
            }
        }

        if (debug) {
            //debugText(q);
        }
    }

    if (realNodesContainer) {
        i = drawNodes(realNodesContainer, nodesToDraw);
        undraw(realNodesContainer, i);
    }


    // for (const q of sortedQuads) {
    //     if (q.image) {
    //         p.image(q.image, q.x - q.r, -(q.y + q.r), q.r * 2, q.r * 2, 0, 0);
    //     } else {
    //         p.push();
    //         p.noFill();
    //         for (const n of q.renderableNodes) {
    //             p.stroke(p.color(n.r, n.g, n.b));
    //             p.strokeWeight(n.size / 5);
    //             p.circle(n.x, -n.y, n.size);
    //         }
    //         p.pop();
    //     }
    //     if (debug) {
    //         debugText(q);
    //     }
    // }
    //
    // if (hoveredArtist) {
    //     p.push();
    //     p.noStroke();
    //     p.fill(hoveredArtist.r, hoveredArtist.g, hoveredArtist.b, 127);
    //     p.circle(hoveredArtist.x, -hoveredArtist.y, hoveredArtist.size);
    //     p.pop();
    // }


    function debugText(q) {
        p.textSize(q.r / 20);
        p.fill('green');
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
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

    Debug.createTimingEvent("Visible Quads Drawing");
}