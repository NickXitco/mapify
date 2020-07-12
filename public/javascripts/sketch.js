let nodeLookup = {};
let quadHead;
let p;
let camera;
let hoveredArtist = null;
let clickedLoading = false;
let clickedArtist = null;
let darkenOpacity = 0;
let unprocessedResponses = [];
let unloadedQuads = new Set();
let loadingQuads = new Set();
let unloadedPQ = new PriorityQueue((a, b) => Utils.dist(camera.x, camera.y, a.x, a.y) - Utils.dist(camera.x, camera.y, b.x, b.y));
let newEdges = true;
let edges = [];

async function loadInitialQuads(loadingQuads, unprocessedResponses) {
    const response = await fetch('quad/A'); //TODO validation on this response
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

function loadUnloaded(unprocessedResponses, unloadedQuadsPriorityQueue, loadingQuads, unloadedQuads) {
    while (!unloadedQuadsPriorityQueue.isEmpty()) {
        const quad = unloadedQuadsPriorityQueue.pop();
        loadingQuads.add(quad);
        unloadedQuads.delete(quad);
        quad.fetchQuad(unprocessedResponses).then();
    }
}

function drawLoading() {
    //TODO loading screen?
}

window.onresize = function() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    console.log(w);
    console.log(h);
    if (p) {
        p.resizeCanvas(w,h);
    }
    camera.zoomCamera({x: camera.x, y: camera.y});
};