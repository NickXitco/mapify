async function loadInitialQuads(loadingQuads, unprocessedResponses) {
    const response = await fetch('quad/A');
    const data = await response.json();
    let quadHead = new Quad(data.x, data.y, data.r, null, null, "A", null);
    loadingQuads.add(quadHead);
    await quadHead.fetchQuad(unprocessedResponses);
    quadHead.splitDown(4);
    return quadHead;
}

function darkenScene(p, darkenOpacity, camera) {
    p.push();
    p.noStroke();
    p.fill(p.color(0, Eases.easeOutQuart(darkenOpacity) * 180));
    p.rectMode(p.RADIUS);
    p.rect(camera.x, -camera.y, camera.width / 2, camera.height / 2);
    p.pop();
    return Math.min(darkenOpacity + 0.05, 1);
}

function loadUnloaded(unprocessedResponses, unloadedQuadsPriorityQueue, loadingQuads, unloadedQuads, camera) {
    let quad = unloadedQuadsPriorityQueue.pop();

    while (quad && !camera.contains(quad)) {
        unloadedQuads.delete(quad);
        quad = unloadedQuadsPriorityQueue.pop();
    }

    if (quad) {
        loadingQuads.add(quad);
        unloadedQuads.delete(quad);
        quad.fetchQuad(unprocessedResponses).then();
    }
}

function drawLoading() {
    //TODO loading screen?
}
