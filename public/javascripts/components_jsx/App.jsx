class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            canvas: null,
            p5: null,
            camera: null,

            hoveredArtist: null,
            clickedArtist: null,
            hoverPoint: {},

            fencing: false,
            fence: [],
            fenceData: null,

            activeGenre: null,

            quadHead: null,

            nodeLookup: {},
            nodeOccurrences: {},

            timingEvents: {},
            lastTime: 0,

            uiHover: false,
            clearSearch: false,

            spButtonExpanded: false,
            randomButtonExpanded: false,

            activePath: {
                nodes: [],
                edges: []
            },

            showChangelog: !this.checkVersion("0.6.0"),
            version: "0.6.0",
            headline: "Shortest Path and More!",
            changes: [
                "Migrated to ArangoDB",
                "You can now play each artist's music from inside the browser! This can be very loud, be careful.",
                "Added a temporary favicon while we still figure out how to brand this thing.",
                "Streamlined a lot of the request pipeline so searching and clicking should feel faster.",
                "Added a back/forward button on the sidebar for artists, genres, and the shortest path.",
                "Added many performance improvements in how much data is loaded onto your device.",
                "Added genre searching. This happens in the same place as artist searching. It's less than optimal right now because of some ArangoDB things, but it will be fixed by 0.7.0",
                "Added a shortest path finder, you can use this by clicking on the arrow button on the left side.",
                "Added a random node button.",
                "Added a (to-be stylized) zoom module in the lower right for those who were struggling with the zooming.",
                "Fixed some bugs with hovering over artists.",
            ],
            upcomingFeatures: [
                "Add previous versions to this changelog!",
                "Performance improvements",
                "Personal spotify integration",
                "Wider trackpad support"
            ],

            cursor: 'auto',
            historyState: new HistoryState(null, PageStates.HOME, null, "")
        }

        this.setCanvas = this.setCanvas.bind(this);
        this.setCamera = this.setCamera.bind(this);

        this.resetCamera = this.resetCamera.bind(this);
        this.zoomCameraOut = this.zoomCameraOut.bind(this);
        this.zoomCameraIn = this.zoomCameraIn.bind(this);

        this.updateClickedArtist = this.updateClickedArtist.bind(this);

        this.handleEmptyClick = this.handleEmptyClick.bind(this);
        this.expandSP = this.expandSP.bind(this);
        this.updatePath = this.updatePath.bind(this);

        this.flipClearSearch = this.flipClearSearch.bind(this);

        this.loadArtistFromUI = this.loadArtistFromUI.bind(this);
        this.loadArtistFromSearch = this.loadArtistFromSearch.bind(this);
        this.createNodesFromSuggestions = this.createNodesFromSuggestions.bind(this);
        this.fetchRandomArtist = this.fetchRandomArtist.bind(this);

        this.updateHoveredArtist = this.updateHoveredArtist.bind(this);
        this.updateHoverPoint = this.updateHoverPoint.bind(this);

        this.updateHoverFlag = this.updateHoverFlag.bind(this);

        this.loadGenreFromSearch = this.loadGenreFromSearch.bind(this);
        this.setQuadHead = this.setQuadHead.bind(this);

        this.tryRemoveChangelog = this.tryRemoveChangelog.bind(this);
        this.checkVersion = this.checkVersion.bind(this);

        this.setFencing = this.setFencing.bind(this);
        this.addFencepost = this.addFencepost.bind(this);
        this.clearFence = this.clearFence.bind(this);
        this.setActiveGenreAppearance = this.setActiveGenreAppearance.bind(this);
        this.clearActiveGenreAppearance = this.clearActiveGenreAppearance.bind(this);

        this.setCursor = this.setCursor.bind(this);

        this.keyDownEvents = this.keyDownEvents.bind(this);

        this.stateHandler = this.stateHandler.bind(this);
        this.hashChangeHandler = this.hashChangeHandler.bind(this);
        this.pushState = this.pushState.bind(this);
        this.processHash = this.processHash.bind(this);
    }

    checkVersion(versionNumber) {
        const clientVersion = localStorage.getItem('mapify-version');
        if (clientVersion !== versionNumber) {
            localStorage.setItem('mapify-version', versionNumber);
            return false;
        } else {
            return true;
        }
    }

    tryRemoveChangelog() {
        this.setState({showChangelog: false});
    }

    updateHoverFlag(value) {
        this.setState({uiHover: value});
    }

    //<editor-fold desc="Clicked Artist Handling">
    updateClickedArtist(artist) {
        if (artist.loaded) {
            this.stateHandler(PageStates.UNKNOWN, PageActions.ARTIST, artist);
        } else if (artist.id) {
            loadArtist(this.state.p5, artist, this.state.quadHead, this.state.nodeLookup).then(() =>{
                    artist = this.state.nodeLookup[artist.id];
                    this.stateHandler(PageStates.UNKNOWN, PageActions.ARTIST, artist);
            });
        }
    }

    setFencing(state) {
        if (state === false && this.state.fence.length > 0) {

            const latLongFence = [];
            for (const post of this.state.fence) {
                const projection = Utils.gnomicProjection(post.x, post.y, 0, -0.5 * Math.PI, PLANE_RADIUS);
                latLongFence.push(projection);
            }

            fetch(`fence`,
                {method: 'POST', headers: {'Content-Type': 'application/json',}, body: JSON.stringify(latLongFence)}
                )
                .then(response => response.json())
                .then(data => {
                    data.posts = this.state.fence;

                    const artists = [];
                    for (const artist of data.top100) {
                        artists.push(createNewNode(artist, this.state.quadHead, this.state.nodeLookup));
                    }
                    data.top100 = artists;

                    const fakeGenre = new Genre('r', new Set(artists), 0, 0, 0, 1);
                    this.state.camera.bubbleMove(fakeGenre.bubble);
                    this.stateHandler(PageStates.UNKNOWN, PageActions.REGION, data);
                });
        }

        this.setState({fencing: state});
    }

    addFencepost(post) {
        const newFence = [...this.state.fence]
        newFence.push(post);
        this.setState({fence: newFence});
    }

    clearFence() {
        this.setState({fence: [], fenceData: null});
    }

    setActiveGenreAppearance(genreName) {
        fetch(`genre/${genreName}`)
            .then(response => response.json())
            .then(data => {
                if (!data.artists || data.artists.length === 0) {
                    return;
                }

                const name = data.name;
                const r = data.r;
                const g = data.g;
                const b = data.b;

                const nodes = new Set(data.artists);

                const newGenre = new Genre(name, nodes, r, g, b, 0.75);

                this.setState({activeGenre: newGenre});
            });
    }

    clearActiveGenreAppearance() {
        this.setState({activeGenre: null});
    }

    loadArtistFromUI(artist) {
        this.updateClickedArtist(artist);
        this.state.camera.artistMove(artist);
    }

    loadArtistFromSearch(searchTerm, isQueryID) {
        loadArtistFromSearch(this.state.p5, searchTerm, isQueryID, this.state.quadHead, this.state.nodeLookup).then(artist => {
            if (artist) {
                this.updateClickedArtist(artist);
                this.state.camera.artistMove(artist);
            }
        });
    }

    createNodesFromSuggestions(data) {
        let newData = [];
        for (const node of data) {
            newData.push(createNewNode(node, this.state.quadHead, this.state.nodeLookup));
        }
        return newData;
    }
    //</editor-fold>

    loadGenreFromSearch(genreName) {
        fetch(`genre/${genreName}`)
            .then(response => response.json())
            .then(data => {
                if (!data.artists || data.artists.length === 0) {
                    return;
                }

                const name = data.name;
                const r = data.r;
                const g = data.g;
                const b = data.b;

                let nodesList = [];
                for (const node of data.artists) {
                    createNewNode(node, this.state.quadHead, this.state.nodeLookup);
                    nodesList.push(this.state.nodeLookup[node.id]);
                }

                const nodes = new Set(nodesList);

                const newGenre = new Genre(name, nodes, r, g, b, 0.75);

                this.state.camera.bubbleMove(newGenre.bubble);
                this.stateHandler(PageStates.UNKNOWN, PageActions.GENRE, newGenre);
            })
    }

    handleEmptyClick() {
        this.stateHandler(PageStates.UNKNOWN, PageActions.MAP, null);
        this.setState({clearSearch: true, spButtonExpanded: false});
    }

    expandSP() {
        this.setState({spButtonExpanded: true});
    }

    updatePath(path) {
        const newPath = [];
        for (const hop of path) {
            const node = createNewNode(hop, this.state.quadHead, this.state.nodeLookup)
            node.images = hop.images;
            node.track = hop.track;
            newPath.push(node);
        }

        const newPathEdges = [];

        for (let i = 0; i < newPath.length - 1; i++) {
            newPathEdges.push(makeEdge(newPath[i], newPath[i + 1]));
        }

        const fakeGenre = new Genre('sp', new Set(newPath), 0, 0, 0, 1);
        this.state.camera.bubbleMove(fakeGenre.bubble);
        this.stateHandler(PageStates.SP_DIALOG, PageActions.DEFAULT, {nodes: newPath, edges: newPathEdges});
    }

    flipClearSearch() {
        this.setState({clearSearch: false});
    }

    updateHoveredArtist(artist) {
        if (this.state.hoveredArtist !== artist) {
            this.setState({hoveredArtist: artist});
        }
        if (artist) {
            this.updateHoverPoint(artist);
        }
    }

    updateHoverPoint(artist) {
        const point = this.state.camera.virtual2screen({x: artist.x, y: artist.y});
        if (this.state.hoverPoint !== point) {
            this.setState({hoverPoint: point});
        }
    }

    fetchRandomArtist() {
        fetch(`random`)
            .then(response => response.json())
            .then(data => {
                loadArtist(this.state.p5, data, this.state.quadHead, this.state.nodeLookup).then(() =>{
                    this.loadArtistFromUI(this.state.nodeLookup[data.id]);
                });
            });
    }

    setCanvas(p5) {
        this.setState({p5: p5});
        this.initializeResizeObserver();
    }

    setCamera(camera) {
        this.setState({camera: camera}, () => {
            this.state.camera.zoomCamera({x: 0, y: 0});
        })
    }

    resetCamera() {
        this.state.camera.reset(30);
    }

    zoomCameraOut() {
        MouseEvents.zooming = true;
        MouseEvents.scrollStep = 0;
        MouseEvents.zoomCoordinates = {x: this.state.camera.x, y: this.state.camera.y};
        MouseEvents.scrollDelta = 1;
    }

    zoomCameraIn() {
        MouseEvents.zooming = true;
        MouseEvents.scrollStep = 0;
        MouseEvents.zoomCoordinates = {x: this.state.camera.x, y: this.state.camera.y};
        MouseEvents.scrollDelta = -1;
    }

    setQuadHead(quadHead) {
        this.setState({quadHead: quadHead});
    }

    initializeResizeObserver() {
        this.ro = new ResizeObserver(entries => {
            if (entries.length !== 1) {
                console.log("I don't know what this is");
            } else {
                const cr = entries[0].contentRect;
                const w = cr.width;
                const h = cr.height;
                if (this.state.p5) {
                    this.state.p5.resizeCanvas(w,h);
                }
                if (this.state.camera) {
                    this.state.camera.zoomCamera({x: this.state.camera.x, y: this.state.camera.y});
                }
            }
        })
        this.ro.observe(document.getElementById("root"));
    }

    setCursor(cursor) {
        this.setState({cursor: cursor})
    }

    keyDownEvents(e) {
        if (e.key === "Escape") {
            this.resetCamera();
        }
    }

    stateHandler(src, action, data) {
        let srcPage = src
        if (src === PageStates.UNKNOWN) {
            srcPage = parseUnknownSource();
        }

        const destPage = stateMapper(srcPage, action);
        let newData = data;
        
        if (srcPage === PageStates.GENRE && destPage === PageStates.GENRE_ARTIST) {
            // Last page must have been full of genre data, so let's get it and add it
            const genreData = this.state.historyState.getData();
            newData = {
                artist: data,
                genre: genreData
            }
        }

        if (srcPage === PageStates.REGION && destPage === PageStates.REGION_ARTIST) {
            // Last page must have been full of genre data, so let's get it and add it
            const regionData = this.state.historyState.getData();
            newData = {
                artist: data,
                region: regionData
            }
        }

        // If we're clicking the map but coming from a two-layered page, we need to restore
        // the data from the next layer.
        if (action === PageActions.MAP) {
            if (srcPage === PageStates.GENRE_ARTIST) {
                newData = this.state.historyState.getData().genre;
            }
            if (srcPage === PageStates.REGION_ARTIST) {
                newData = this.state.historyState.getData().region;
            }
        }

        let url = ""

        if (destPage === PageStates.ARTIST) {
            url = `a=${newData.id}`
        } else if (destPage === PageStates.GENRE) {
            url = `g=${encodeURIComponent(newData.name)}`;
        } else if (destPage === PageStates.PATH) {
            url = `p=${newData.nodes[0].id},${newData.nodes[newData.nodes.length - 1].id}`;
        } else if (destPage === PageStates.REGION) {
            url = `r=${Utils.regionToString(newData.posts)}`
        } else if (destPage === PageStates.REGION_ARTIST) {
            url = `r=${Utils.regionToString(newData.region.posts)}&a=${newData.artist.id}`;
        } else if (destPage === PageStates.GENRE_ARTIST) {
            url = `g=${encodeURIComponent(newData.genre.name)}&a=${newData.artist.id}`;
        }

        // If we're looking at an artist, we need to make sure those artists' edges are made.
        let artist = null;
        if (destPage === PageStates.ARTIST) {
            artist = newData;
        }

        if (destPage === PageStates.REGION_ARTIST || destPage === PageStates.GENRE_ARTIST) {
            artist = newData.artist;
        }

        if (artist) {
            artist.edges = makeEdges(artist);
        }

        // Clear the activeGenre (used for hovering)
        if (destPage !== PageStates.GENRE && destPage !== PageStates.GENRE_ARTIST) {
            this.setState({activeGenre: null});
        }

        this.setState({fencing: false, fence: [], fenceData: null});

        this.pushState(url);

        const lastState = this.state.historyState;
        const newState = new HistoryState(lastState, destPage, newData, url);
        lastState.next = newState;
        this.setState({historyState: newState});
        return newState;
    }

    hashChangeHandler(e) {
        let hash = e.currentTarget.location.hash;
        if (hash === "") {
            window.history.replaceState("", document.title, window.location.pathname + window.location.search);
        }

        this.processHash(hash.replace("#", ""));
    }

    pushState(url) {
        window.location.hash = url;
    }

    processHash(hash) {
        //Three options:
        //1. This hash is our current location, which means we just do nothing
        //2. This hash is in our history, which means we can render it
        //3. This hash is not in our history, which means we have to process and create it.


        // Scenario 1
        if (this.state.historyState.url === hash) {
            return;
        }

        let current = this.state.historyState.prev;
        let newState;
        while (current) {
            if (current.url === hash) {
                newState = current;
                break;
            }
            current = current.prev;
        }

        // Scenario 2
        if (newState) {
            newState.detachSelf();
            const lastState = this.state.historyState;
            newState.prev = lastState;
            newState.next = null;
            lastState.next = newState;
            this.setState({historyState: newState});

            switch (newState.page) {
                case PageStates.ARTIST:
                    this.state.camera.artistMove(newState.getData());
                    break;
                case PageStates.REGION_ARTIST:
                case PageStates.GENRE_ARTIST:
                    this.state.camera.artistMove(newState.getData().artist);
                    break;
                case PageStates.PATH:
                    this.state.camera.bubbleMove(
                        new Genre(
                            'sp', new Set(newState.getData().nodes), 0, 0, 0, 1
                        ).bubble
                    );
                    break;
                case PageStates.GENRE:
                    this.state.camera.bubbleMove(newState.getData().bubble);
                    break;
                case PageStates.REGION:
                    this.state.camera.bubbleMove(
                        new Genre(
                            'sp', new Set(newState.getData().top100), 0, 0, 0, 1
                        ).bubble
                    );
                    break;
                default:
                    this.state.camera.reset(30);
                    break;
            }

            return;
        }

        // Scenario 3
        // Wait for p5 to be defined:
        // function waitForElement(){
        //     if(typeof someVariable !== "undefined"){
        //         //variable exists, do what you want
        //     }
        //     else{
        //         setTimeout(waitForElement, 250);
        //     }
        // }
        // const validatedHash = this.validateHash(hash);
        //
        // if (!validatedHash) {
        //     this.stateHandler(PageStates.UNKNOWN, PageActions.MAP, null);
        //     this.resetCamera();
        //     return
        // }
        //
        // switch (validatedHash.page) {
        //     case PageStates.ARTIST:
        //         this.loadArtistFromSearch(validatedHash.data.artist, true);
        //         break;
        //     case PageStates.GENRE:
        //         this.loadGenreFromSearch(validatedHash.data.genre);
        //         break;
        //     case PageStates.REGION:
        //         // TODO turn string into array
        //         //  Loop through array
        //         //  For every point, call this.addPost(point)
        //         //  Then setFencing(false)
        //         break;
        //     case PageStates.PATH:
        //         // fetch(`path/${start.id}/${end.id}`)
        //         //     .then(res => res.json())
        //         //     .then(path => this.updatePath(path));
        //         break;
        //     case PageStates.REGION_ARTIST:
        //         // No idea, might have to change all of these to do separate loading
        //     case PageStates.GENRE_ARTIST:
        //         break;
        // }
    }

    validateHash(hash) {
        const hashSplit = hash.split(/[&=]+/);
        const MAX_PARAMS = 2;
        if (hashSplit.length < 2 || hashSplit.length > MAX_PARAMS * 2 || hashSplit.length % 2 !== 0) {
            return null;
        }

        const validatedHash = {numParams: hashSplit.length / 2, page: "", data: {}};
        for (let i = 0; i < hashSplit.length / 2; i++) {
            const param = hashSplit[i * 2];
            if (i > 1 && param !== "a") return null;
            if (i === 0 && hashSplit.length > 2 && (param !== "g" && param !== "r")) return null;

            const value = hashSplit[i + 1];
            switch (param) {
                case "a":
                    validatedHash.data.artist = value;
                    if (validatedHash.numParams === 1) {
                        validatedHash.page = PageStates.ARTIST;
                    }
                    break;
                case "g":
                    validatedHash.data.genre = decodeURIComponent(value);
                    if (validatedHash.numParams === 1) {
                        validatedHash.page = PageStates.GENRE;
                    } else {
                        validatedHash.page = PageStates.GENRE_ARTIST;
                    }
                    break;
                case "p":
                    validatedHash.data.path = value;
                    if (validatedHash.numParams === 1) {
                        validatedHash.page = PageStates.PATH;
                    }
                    break;
                case "r":
                    validatedHash.data.region = value;
                    if (validatedHash.numParams === 1) {
                        validatedHash.page = PageStates.REGION;
                    } else {
                        validatedHash.page = PageStates.REGION_ARTIST;
                    }
                    break;
                default:
                    return null;
            }
        }
        return validatedHash;
    }

    componentDidMount() {
        window.addEventListener("hashchange", this.hashChangeHandler);
        if (window.location.hash) {
            this.processHash(window.location.hash.replace("#", ""));
        }
    }

    render() {
        let changelog = null;
        if (this.state.showChangelog) {
            changelog = (
                <Changelog
                    version={this.state.version}
                    headline={this.state.headline}
                    changes={this.state.changes}
                    upcoming={this.state.upcomingFeatures}

                    updateHoverFlag={this.updateHoverFlag}
                    tryRemoveChangelog={this.tryRemoveChangelog}
                />
            );
        }
        
        const historyState = this.state.historyState


        let clickedArtist = null;
        let activePath = {nodes: [], edges: []};
        let activeGenre = this.state.activeGenre; // This is needed for genre hover in region
        let fence = this.state.fence; // This is needed for active fence drawing
        let colorant;

        switch (historyState.page) {
            case PageStates.ARTIST:
                clickedArtist = historyState.getData();
                colorant = clickedArtist;
                break;
            case PageStates.GENRE_ARTIST:
                clickedArtist = historyState.getData().artist;
                activeGenre = historyState.getData().genre;
                colorant = clickedArtist;
                break;
            case PageStates.REGION_ARTIST:
                clickedArtist = historyState.getData().artist;
                fence = historyState.getData().region.posts;
                colorant = clickedArtist;
                break;
            case PageStates.PATH:
                activePath = historyState.getData();
                colorant = activePath.nodes.length > 0 ? activePath.nodes[0] : null;
                break;
            case PageStates.GENRE:
                activeGenre = historyState.getData();
                colorant = activeGenre;
                break;
            case PageStates.REGION:
                fence = historyState.getData().posts;
                const g = historyState.getData().genres[0];
                colorant = new Colorant(g.r, g.g, g.b, true);
                break;
            default:
        }

        let cursorStyle = {
            cursor: this.state.cursor
        }

        return (
            <div className={"fullScreen"} style={cursorStyle}>
                {changelog}

                <ShortestPathDialog
                    colorant={colorant}
                    expanded={this.state.spButtonExpanded}
                    updateHoverFlag={this.updateHoverFlag}
                    clickHandler={this.expandSP}
                    createNodesFromSuggestions={this.createNodesFromSuggestions}
                    updateHoveredArtist={this.updateHoveredArtist}
                    getArtistFromSearch={this.getArtistFromSearch}
                    updatePath={this.updatePath}
                />

                <RandomNodeButton
                    colorant={colorant}
                    expanded={this.state.randomButtonExpanded}
                    updateHoverFlag={this.updateHoverFlag}
                    clickHandler={this.fetchRandomArtist}
                />

                <ReactInfobox
                    artist={this.state.hoveredArtist}
                    point={this.state.hoverPoint}
                />

                <ReactSidebar
                    historyState={this.state.historyState}
                    uiHover={this.state.uiHover}

                    loadArtistFromUI={this.loadArtistFromUI}
                    loadGenreFromSearch={this.loadGenreFromSearch}
                    updateHoveredArtist={this.updateHoveredArtist}
                    updateHoverFlag={this.updateHoverFlag}
                    setActiveGenreAppearance={this.setActiveGenreAppearance}
                    clearActiveGenreAppearance={this.clearActiveGenreAppearance}
                />

                <div className="rightSideDiv">
                    <ReactSearchBox
                        colorant={colorant}

                        loadArtistFromUI={this.loadArtistFromUI}
                        loadArtistFromSearch={this.loadArtistFromSearch}
                        loadGenreFromSearch={this.loadGenreFromSearch}

                        flipClearSearch={this.flipClearSearch}
                        clearSearch={this.state.clearSearch}

                        updateHoverFlag={this.updateHoverFlag}
                        updateHoveredArtist={this.updateHoveredArtist}
                        createNodesFromSuggestions={this.createNodesFromSuggestions}
                    />

                    <div className="flexSpacer"/>

                    <ZoomModule
                        colorant={colorant}

                        updateHoverFlag={this.updateHoverFlag}

                        resetCamera={this.resetCamera}
                        zoomCameraOut={this.zoomCameraOut}
                        zoomCameraIn={this.zoomCameraIn}
                    />
                </div>

                <P5Wrapper
                    hoveredArtist={this.state.hoveredArtist}

                    clickedArtist={clickedArtist}
                    path={activePath}
                    genre={activeGenre}
                    fence={fence}

                    nodeLookup={this.state.nodeLookup} //TODO consider removing this from P5 and do all load handling at the app level.
                    quadHead={this.state.quadHead}
                    camera={this.state.camera}
                    p5={this.state.p5}

                    setQuadHead={this.setQuadHead}
                    setCanvas={this.setCanvas}
                    setCamera={this.setCamera}

                    uiHover={this.state.uiHover}
                    updateHoverFlag={this.updateHoverFlag}

                    updateClickedArtist={this.updateClickedArtist}
                    handleEmptyClick={this.handleEmptyClick}
                    updateHoveredArtist={this.updateHoveredArtist}

                    setCursor={this.setCursor}

                    setFencing={this.setFencing}
                    addFencepost={this.addFencepost}
                    clearFence={this.clearFence}
                    fencing={this.state.fencing}

                    keyDownEvents={this.keyDownEvents}
                />
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);