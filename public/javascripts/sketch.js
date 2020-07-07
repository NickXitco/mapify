let canvas = null;
let camera = new Camera(0, 0, window.innerHeight, window.innerWidth, 1);
let loading = true;

const MAX_CURVE_ANGLE = 180;

let hoveredArtist = null;
let clickedLoading = false;
let clickedArtist = null;

let darkenOpacity = 0;

//let quadCache = new Cache(100);

let quadHead;
let unprocessedResponses = [];

let unloadedQuads = new Set();
let loadingQuads = new Set();
let unloadedQuadsPriorityQueue = new PriorityQueue((a, b) => dist(camera.x, camera.y, a.x, a.y) - dist(camera.x, camera.y, b.x, b.y));

let edgeDrawing = false;
let newEdges = true;
let edges = [];

let nodeLookup = {};
let nodeOccurences = {};

let timingEvents = {};

async function getClickedSuggestion(index) {
    if (SearchBox.recentSuggestedArtists.length >= index) {
        loadArtistFromSearch(SearchBox.recentSuggestedArtists[index - 1].id, true).then(_ => {
                Sidebar.resetSidebar(false);}
            );
    }
}

async function getClickedRelated(id) {
    loadArtistFromSearch(id, true).then(_ => {
        Sidebar.resetSidebar(false);}
    );
}

async function getGenre(genreName) {
    const response = await fetch('genre/' + genreName);
    const data = await response.json();
    console.log(data);
}

let blur;
// noinspection JSUnusedGlobalSymbols
function preload() {
    blur = loadImage('images/blur.png');
}

// noinspection JSUnusedGlobalSymbols
function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.mouseOver(() => {Sidebar.hoverFlag = false; SearchBox.hoverFlag = false;})
    camera.zoomCamera({x: 0, y:0 });

    loadInitialQuads().then();//TODO loadInitialQuads, probably the first 16? but load the first 128 (or more?) into memory

    angleMode(DEGREES);
    rectMode(RADIUS);
}

async function loadInitialQuads() {
    const response = await fetch('quad/A'); //TODO validation on this response
    const data = await response.json();
    quadHead = new Quad(data.x, data.y, data.r, null, null, "A", null);
    loadingQuads.add(quadHead);
    await quadHead.fetchQuad();
    quadHead.splitDown(4);
    loading = false;
}

// noinspection JSUnusedGlobalSymbols
function draw() {
    if (loading) {
        drawLoading();
        return;
    }

    background(3);

    resetTiming();
    createTimingEvent("Drawing Setup");

    MouseEvents.drift(camera);
    MouseEvents.zoom();

    if (SearchBox.point) {
        camera.setCameraMove(SearchBox.point.x, SearchBox.point.y, camera.getZoomFromWidth(SearchBox.point.size * 50), 30);

        clickedArtist = SearchBox.point;
        edgeDrawing = true;
        newEdges = true;
        SearchBox.point = null;
    }

    camera.doCameraMove();

    push();
    camera.setView();

    createTimingEvent("Camera Moves");

    drawOnscreenQuads(quadHead, camera);

    loadUnloaded();
    getHoveredArtist();

    if (clickedArtist && !clickedArtist.loaded && !clickedLoading) {
        loadArtist(clickedArtist).then();
    }

    createTimingEvent("Get Hovered Artist");

    if (edgeDrawing) {
        push();
        noStroke();
        fill(color(0, Eases.easeOutQuart(darkenOpacity) * 180));
        darkenOpacity = min(darkenOpacity + 0.05, 1);
        rectMode(RADIUS);
        rect(camera.x, -camera.y, camera.width / 2, camera.height / 2);
        pop();
    } else {
        darkenOpacity = 0;
    }

    createTimingEvent("Darken Scene");

    if (edgeDrawing && clickedArtist && clickedArtist.loaded) {
        drawEdges(clickedArtist);
        createTimingEvent("Draw Related Edges");
        drawRelatedNodes(clickedArtist);
        createTimingEvent("Draw Related Nodes");
    }

    if (clickedArtist && clickedArtist.loaded && Sidebar.artist !== clickedArtist) {
        Sidebar.setSidebar(clickedArtist);
    }

    if (clickedArtist && Sidebar.openAmount < 1) {
        Sidebar.openSidebar();
    }

    createTimingEvent("Sidebar");

    if (frameCount % 5 === 0) { //TODO adjust this until it feels right, or adjust it dynamically?
        processOne();
    }

    createTimingEvent("Quad Processing");

    pop();
    InfoBox.drawInfoBox(hoveredArtist);

    createTimingEvent("Info Box");
    Debug.debugAll(camera, timingEvents);
}

let lastTime = 0;
function createTimingEvent(name) {
    timingEvents[name] = performance.now() - lastTime;
    lastTime = performance.now();
}

function resetTiming() {
    lastTime = performance.now();
    for (const timingName of Object.keys(timingEvents)) {
        timingEvents[timingName] = 0;
    }
}

function loadUnloaded() {
    while (!unloadedQuadsPriorityQueue.isEmpty()) {
        const quad = unloadedQuadsPriorityQueue.pop();
        loadingQuads.add(quad);
        unloadedQuads.delete(quad);
        quad.fetchQuad().then();
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
    resizeCanvas(w,h);
    camera.zoomCamera({x: camera.x, y: camera.y});
};