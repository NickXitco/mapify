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

let infoBox = document.getElementById("infoBox");
let infoBoxArtistName = document.getElementById("infoBoxArtistName");
let infoBoxArtistGenre = document.getElementById("infoBoxArtistGenre");

let searchPoint = null;
let searchInput = document.getElementById("searchInput");
let suggestionTexts = [document.getElementById("suggestionText1"), document.getElementById("suggestionText2"), document.getElementById("suggestionText3"), document.getElementById("suggestionText4"), document.getElementById("suggestionText5")];
let suggestionBoxes = [document.getElementById("suggestion1"), document.getElementById("suggestion2"), document.getElementById("suggestion3"), document.getElementById("suggestion4"), document.getElementById("suggestion5")];
let searchDiv = document.getElementById("searchBox");
let recentSuggestedArtists = [];
let searchHover = false;

let sidebar = document.getElementById("sidebar");
let sidebarStroke = document.getElementById("sidebarStroke");
let sidebarArtistName = document.getElementById("sidebarArtistName");
let sidebarFollowersCount = document.getElementById("followerCount");
let sidebarFollowersWord = document.getElementById("followers");
let sidebarFollowersRanking = document.getElementById("followerRanking");
let genresList = document.getElementById("genresList");
let relatedArtistsList = document.getElementById("relatedArtistsList");
let sidebarPicture = document.getElementById("sidebarPicture");
let sidebarOpenAmount = 0;
let sidebarArtist = null;
let sidebarHover = false;

async function getClickedSuggestion(index) {
    if (recentSuggestedArtists.length >= index) {
        loadArtistFromSearch(recentSuggestedArtists[index - 1].id, true).then();
        resetSidebar(false);
    }
}

async function getClickedRelated(id) {
    loadArtistFromSearch(id, true).then();
}


searchInput.onkeyup = async function (e) {
    if (e.key === 'Enter' && searchInput.value.length > 0) {
        loadArtistFromSearch(searchInput.value, false).then();
        resetSidebar(false);
    }

    let suggestionsHeight = 34;

    if (searchInput.value.length > 2) {
        const url = "artistSearch/" + searchInput.value;
        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            suggestionTexts[0].innerText = "No Results Found.";
            suggestionTexts[0].fontWeight = "600";
            suggestionBoxes[i].style.display = "block";
            suggestionsHeight += 20;

            for (let i = 1; i < suggestionTexts.length; i++) {
                suggestionBoxes[i].style.display = "none";
                suggestionTexts[i].style.height = "0";
            }
        } else {
            suggestionTexts[0].fontWeight = "300";
        }

        recentSuggestedArtists = data;

        for (let i = 0; i < suggestionTexts.length; i++) {
            if (data.length >= i + 1) {
                suggestionTexts[i].innerText = data[i].name;
                suggestionBoxes[i].style.display = "block";
                suggestionsHeight += 20;
            } else {
                suggestionTexts[i].innerText = "";
                suggestionBoxes[i].style.display = "none";
            }
        }
    } else {
        for (let i = 0; i < suggestionTexts.length; i++) {
            suggestionTexts[i].innerText = "";
            suggestionBoxes[i].style.display = "none";
        }
    }

    searchDiv.style.height = suggestionsHeight + "px";
}

async function loadArtistFromSearch(query, isQueryID) {
    const response = await fetch('artist/' + query + "/" + isQueryID);
    const data = await response.json();
    if (!data) {
        return;
    }

    createNewNode(data);
    let node = nodeLookup[data.id];

    for (const r of data.related) {
        createNewNode(r);
        node.relatedVertices.add(nodeLookup[r.id]);
    }
    node.loaded = true;

    searchPoint = node;
    clickedArtist = node;
    edgeDrawing = true;
}

function createNewNode(data) {
    let exists = true;
    if (!nodeLookup.hasOwnProperty(data.id)) {
        nodeLookup[data.id] = new Artist(data);
        exists = false;
    }

    if (!nodeOccurences.hasOwnProperty(data.id)) {
        nodeOccurences[data.id] = 1;
    } else {
        nodeOccurences[data.id]++;
    }

    if (exists) {
        const q = nodeLookup[data.id].quad;
        if (q) {
            q.n = null;
        }
        nodeLookup[data.id].quad = null;
    }
    quadHead.insert(nodeLookup[data.id]);
}

let blur;
// noinspection JSUnusedGlobalSymbols
function preload() {
    blur = loadImage('images/blur.png');
}

// noinspection JSUnusedGlobalSymbols
function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
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
    stroke(255);
    noFill();

    drift(camera);
    zoom();

    if (searchPoint) {
        camera.x = searchPoint.x;
        camera.y = searchPoint.y;
        camera.zoomFromWidth(searchPoint.size * 50);
        camera.zoomCamera({x: searchPoint.x, y: searchPoint.y});

        clickedArtist = searchPoint;
        edgeDrawing = true;
        newEdges = true;
        searchPoint = null;
    }

    push();
    camera.setView();

    drawOnscreenQuads(quadHead, camera);

    loadUnloaded();
    getHoveredArtist();

    if (clickedArtist && !clickedArtist.loaded && !clickedLoading) {
        loadArtist(clickedArtist).then();
    }

    if (edgeDrawing) {
        push();
        noStroke();
        fill(color(0, easeOutQuart(darkenOpacity) * 180));
        darkenOpacity = min(darkenOpacity + 0.05, 1);
        rectMode(RADIUS);
        rect(camera.x, -camera.y, camera.width / 2, camera.height / 2);
        pop();
    } else {
        darkenOpacity = 0;
    }

    if (edgeDrawing && clickedArtist && clickedArtist.loaded) {
        drawEdges(clickedArtist);
        drawRelatedNodes(clickedArtist);
    }

    if (clickedArtist && clickedArtist.loaded && sidebarArtist !== clickedArtist) {
        setSidebar(clickedArtist);
    }

    if (frameCount % 5 === 0) {
        processOne();
    }

    if (clickedArtist && sidebarOpenAmount < 1) {
        openSidebar();
    }

    pop();

    drawInfoBox(hoveredArtist);

    //Debug.debugAll(camera);
}

function setSidebar(artist) {
    sidebarArtist = clickedArtist;
    sidebar.style.display = "block";
    let fontSize = 60;
    sidebarArtistName.style.fontSize = fontSize + "px";
    sidebarArtistName.innerText = artist.name;
    while (sidebarArtistName.clientHeight > 150 || sidebarArtistName.clientWidth > 400) {
        fontSize -= 2;
        sidebarArtistName.style.fontSize = fontSize + "px"
    }

    if (artist.followers >= 1000000) {
        sidebarFollowersCount.innerText = (artist.followers * 1.0 / 1000000).toFixed(1).toString() + " Million";
    } else if (artist.followers >= 1000) {
        sidebarFollowersCount.innerText = (artist.followers * 1.0 / 1000).toFixed(1).toString() + " Thousand";
    } else {
        sidebarFollowersCount.innerText = artist.followers;
    }

    if (artist.followers === 1) {
        sidebarFollowersWord.innerText = "Follower";
    } else {
        sidebarFollowersWord.innerText = "Followers";
    }

    if (artist.rank) {
        sidebarFollowersRanking.innerText = "(#" + artist.rank + ")";
    } else {
        sidebarFollowersRanking.innerText = "";
    }

    if (artist.genres) {
        for (const genre of artist.genres) {
            const newGenre = document.createElement("li");
            newGenre.className = "sidebarListItem";
            newGenre.innerText = genre;
            genresList.appendChild(newGenre);
        }
    } else {
        //TODO don't show genre text at all;
    }

    if (artist.relatedVertices) {
        for (const r of artist.relatedVertices) {
            const newRelated = document.createElement("li");
            const id = r.id.valueOf();
            newRelated.className = "sidebarListItem";
            newRelated.innerText = r.name;
            newRelated.onclick = () => {
                getClickedRelated(id).then();
                resetSidebar(false);
            };
            relatedArtistsList.appendChild(newRelated);
        }
    } else {
        //TODO don't show related text at all;
    }

    sidebarPicture.style.boxShadow = "0 0 13px 1px " + artist.color.toString();
    sidebarStroke.style.boxShadow = "0 0 13px 1px " + artist.color.toString();
    sidebarStroke.style.background = artist.color.toString();
    searchInput.style.borderColor = artist.color.toString();
    searchInput.style.boxShadow = "0 0 6px 0.5px " + artist.color.toString();
}

function resetSidebar(removeFromFlow) {
    sidebarArtistName.innerText = "";
    sidebarFollowersRanking.innerText = "";
    sidebarFollowersWord.innerText = "";
    sidebarFollowersCount.innerText = "";
    while (genresList.firstChild) {
        genresList.removeChild(genresList.lastChild);
    }

    while (relatedArtistsList.firstChild) {
        relatedArtistsList.removeChild(relatedArtistsList.lastChild);
    }

    searchInput.style.borderColor = "white";
    searchInput.style.boxShadow = "0 0 6px 0.5px white";

    if (removeFromFlow) {
        sidebar.style.display = "none";
        sidebarOpenAmount = 0;
    }
}

function openSidebar() {
    /*
    const twentyFive = width / 4;
    sidebar.style.width = (easeOutQuart(sidebarOpenAmount) * twentyFive) + "px";
    sidebarOpenAmount = Math.min(1, sidebarOpenAmount + 0.05);
     */
}

function drawRelatedNodes(clickedArtist) {
    for (const related of clickedArtist.relatedVertices) {
        push();
        fill(color(red(related.color), green(related.color), blue(related.color), 127));
        stroke(related.color);
        strokeWeight(related.size / 5);
        circle(related.x, -related.y, related.size);
        pop();
    }
    push();
    fill(0, 255);
    stroke(clickedArtist.color);
    strokeWeight(clickedArtist.size / 5);
    circle(clickedArtist.x, -clickedArtist.y, clickedArtist.size);
    pop();
}


function easeOutQuart(x) {
    return 1 - pow(1 - x, 4);
}

async function loadArtist(artist) {
    clickedLoading = true;
    const response = await fetch('artist/' + artist.id + "/true");
    const data = await response.json();

    createNewNode(data);
    let node = nodeLookup[data.id];

    for (const r of data.related) {
        createNewNode(r);
        node.relatedVertices.add(nodeLookup[r.id]);
    }
    node.loaded = true;
    clickedLoading = false;
}

function drawEdges(clickedArtist) {
    if (newEdges) {
        edges = [];
        for (const related of clickedArtist.relatedVertices) {
            edges.push({
                u: clickedArtist,
                v: related,
                cUrad: Math.random() / 2,
                cUang: Math.random() * MAX_CURVE_ANGLE - MAX_CURVE_ANGLE / 2,
                cVrad: Math.random() / 2,
                cVang: Math.random() * MAX_CURVE_ANGLE - MAX_CURVE_ANGLE / 2,
                tMax: 0
            });
        }
        newEdges = false;
    }

    for (const e of edges) {
        DrawingHelpers.drawEdge(e);
    }
}

function processOne() {
    if (unprocessedResponses.length > 0) {
        const r = unprocessedResponses.pop();
        const q = r.quad;

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
                loadingQuads.delete(quad);
            });
        }

        /*
        let evicted = quadCache.insert(q, q.name);
        if (evicted) {
            evicted.deleteSelf(nodeOccurences, nodeLookup);
        }
         */
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

const TILE_WIDTH = 1024;
function drawOnscreenQuads(quadHead, camera) {
    let quads = new Set();
    let stack = [];
    stack.push(quadHead);
    const scale = camera.getZoomFactor().x;
    while (stack.length > 0) {
        let q = stack.pop();
        if (camera.contains(q)) {
            if (!q.image) {
                if (!loadingQuads.has(q) && !unloadedQuads.has(q)) {
                    unloadedQuads.add(q);
                    unloadedQuadsPriorityQueue.push(q);
                }
            }
            if ((q.r * 2 * scale) / TILE_WIDTH > 1) {
                if (q.leaf) {
                    while (!q.image && q.name !== "A") {
                        q = q.parent;
                    }
                    quads.add(q);
                } else {
                    stack.push(q.A);
                    stack.push(q.B);
                    stack.push(q.C);
                    stack.push(q.D);
                }
            } else if ((q.r * 2 * scale) / TILE_WIDTH >= 0.5) {
                while (!q.image && q.name !== "A") {
                    q = q.parent;
                }
                quads.add(q);
            }
        }
    }

    push();
    noFill();
    stroke('white');
    for (const q of [...quads].sort((a, b) => a.name.length - b.name.length)) {

        /*
        let evicted = quadCache.insert(q, q.name);
        if (evicted) {
            evicted.deleteSelf(nodeOccurences, nodeLookup);
        }
         */

        if (q.image) {
            noStroke();
            textSize(q.r / 10);
            image(q.image, q.x - q.r, -(q.y + q.r), q.r * 2, q.r * 2, 0, 0);
            fill('white');
            textAlign(CENTER, CENTER);
            //text(q.name, q.x, -q.y);
            textSize(q.r / 20);
            fill('green')
            textAlign(LEFT, TOP);
            //text('Actual Size: (' + q.image.width + ', ' + q.image.height + ')', q.x - q.r, -(q.y + q.r));
            //text('Displayed Size: (' + q.r * 2 * camera.getZoomFactor().x + ', ' + q.r * 2 * camera.getZoomFactor().y + ')', q.x - q.r, -(q.y + q.r * 0.95));
            //text('Number of Nodes Inside: ' + q.renderableNodes.size, q.x - q.r, -(q.y + q.r * 0.90));
            noFill();
            stroke('white');
            strokeWeight(quad.r / 100);
            //rect(q.x, -q.y, q.r, q.r);
        }
    }
    pop();
}

function drawInfoBox(hoveredArtist) {
    if (!hoveredArtist) {
        infoBox.style.visibility = "hidden";
        return;
    }
    push();
    const point = camera.virtual2screen({x: hoveredArtist.x, y: hoveredArtist.y});
    infoBox.style.visibility = "visible";
    infoBox.style.borderColor = hoveredArtist.color.toString();
    infoBox.style.boxShadow = "0 0 3px 1px " + hoveredArtist.color.toString();

    infoBoxArtistName.innerText = hoveredArtist.name;
    if (hoveredArtist.genres.length > 0) {
        infoBoxArtistGenre.innerText = hoveredArtist.genres[0];
    } else {
        infoBoxArtistGenre.innerText = "";
    }

    const w = Math.max(infoBoxArtistName.clientWidth, infoBoxArtistGenre.clientWidth);
    const h = infoBoxArtistName.clientHeight + infoBoxArtistGenre.clientHeight;

    infoBox.style.width = w + "px";
    infoBox.style.height = h + "px";

    if (point.x >= width / 2) {
        infoBox.style.left = (point.x - w - 6) + "px";
        infoBox.style.borderRadius =  "50px 0 100px 0";
        infoBox.style.textAlign = "left";
        infoBoxArtistName.style.float = "left";
        infoBoxArtistGenre.style.float = "left";
        infoBoxArtistName.style.padding = "10px 50px 0 20px";
        infoBoxArtistGenre.style.padding = "0 75px 10px 20px";
    } else {
        infoBox.style.left = (point.x) + "px";
        infoBox.style.borderRadius =  "0 50px 0 100px";
        infoBox.style.textAlign = "right";
        infoBoxArtistName.style.float = "right";
        infoBoxArtistGenre.style.float = "right";
        infoBoxArtistName.style.padding = "10px 20px 0 50px";
        infoBoxArtistGenre.style.padding = "0 20px 10px 75px";
    }

    infoBox.style.top = (point.y) + "px";


    pop();
}

function getHoveredArtist() {
    if (searchHover || sidebarHover) {
        hoveredArtist = null;
        return;
    }

    let stack = [];
    const mP = getVirtualMouseCoordinates();
    stack.push(quadHead);
    let foundQuad;
    while (stack.length > 0) {
        let q = stack.pop();

        if (q.contains(mP.x, mP.y)) {
            if (q.leaf) {
                foundQuad = q;
                break;
            }

            stack.push(q.A);
            stack.push(q.B);
            stack.push(q.C);
            stack.push(q.D);
        }
    }

    if (!foundQuad) {
        hoveredArtist = null;
        return;
    }

    /*
    let evicted = quadCache.insert(foundQuad, foundQuad.name);
    if (evicted) {
        evicted.deleteSelf(nodeOccurences, nodeLookup);
    }
     */

    let closest = null;
    let closestDistance = Infinity;
    for (const node of foundQuad.renderableNodes) {
        let d = dist(mP.x, mP.y, node.x, node.y);
        if (d < node.size / 2) {
            if (d < closestDistance) {
                closest = node;
                closestDistance = d;
            }
        }
    }

    if (clickedArtist) {
        if (clickedArtist.relatedVertices.has(closest) || closest === clickedArtist) {
            hoveredArtist = closest;
        } else {
            hoveredArtist = null;
            return;
        }
    }

    hoveredArtist = closest;
}

window.onresize = function() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    console.log(w);
    console.log(h);
    resizeCanvas(w,h);
    camera.zoomCamera({x: camera.x, y: camera.y});
};