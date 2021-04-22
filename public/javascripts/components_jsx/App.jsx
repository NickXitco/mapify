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

            currentSidebarState: null,

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
        this.setSidebarState = this.setSidebarState.bind(this);
        this.undoSidebarState = this.undoSidebarState.bind(this);
        this.redoSidebarState = this.redoSidebarState.bind(this);

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
            this.setSidebarState(artist, this.state.activeGenre, {nodes: [], edges: []}, {x: artist.x, y: artist.y, zoom: this.state.camera.getZoomFromWidth(artist.size * 50)}, null);
            this.stateHandler(PageStates.UNKNOWN, PageActions.ARTIST, artist);
        } else if (artist.id) {
            loadArtist(this.state.p5, artist, this.state.quadHead, this.state.nodeLookup).then(() =>{
                    artist = this.state.nodeLookup[artist.id];
                    this.setSidebarState(artist, this.state.activeGenre, {nodes: [], edges: []}, {x: artist.x, y: artist.y, zoom: this.state.camera.getZoomFromWidth(artist.size * 50)}, null);
                    this.stateHandler(PageStates.UNKNOWN, PageActions.ARTIST, artist);
            });
        }
        this.setState({hoveredArtist: null});
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

                    this.stateHandler(PageStates.UNKNOWN, PageActions.REGION, data);
                    this.setState({fence: [], fenceData: null});
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

    setSidebarState(artist, genre, path, camera, state) {
        if (artist) {
            artist.edges = makeEdges(artist);
        }

        if (!state && (artist || genre ||  path.nodes.length > 0)) {
            state = new SidebarState({artist: artist, genre: genre, path: path, camera: camera}, this.state.currentSidebarState);
        }

        this.setState({
            clickedArtist: artist,
            activeGenre: genre,
            activePath: path,
            currentSidebarState: state
        });
        //TODO migrate all this to state router handling
    }

    undoSidebarState() {
        if (this.state.currentSidebarState && this.state.currentSidebarState.canUndo()) {
            const newSidebarState = this.state.currentSidebarState.undo();
            this.setSidebarState(newSidebarState.payload.artist, newSidebarState.payload.genre, newSidebarState.payload.path, newSidebarState.payload.camera, newSidebarState);
            this.state.camera.setCameraMove(newSidebarState.payload.camera.x, newSidebarState.payload.camera.y, newSidebarState.payload.camera.zoom, 45);
        }
    }

    redoSidebarState() {
        if (this.state.currentSidebarState && this.state.currentSidebarState.canRedo()) {
            const newSidebarState = this.state.currentSidebarState.redo();
            this.setSidebarState(newSidebarState.payload.artist, newSidebarState.payload.genre, newSidebarState.payload.path, newSidebarState.payload.camera, newSidebarState);
            this.state.camera.setCameraMove(newSidebarState.payload.camera.x, newSidebarState.payload.camera.y, newSidebarState.payload.camera.zoom, 45);
        }
    }

    loadArtistFromUI(artist) {
        //TODO remove this from here and manage it in sidebar state
        this.setState({fencing: false, fence: [], fenceData: null});

        this.updateClickedArtist(artist);
        this.state.camera.setCameraMove(artist.x, artist.y, this.state.camera.getZoomFromWidth(artist.size * 50), 45);
    }

    loadArtistFromSearch(searchTerm) {
        loadArtistFromSearch(this.state.p5, searchTerm, false, this.state.quadHead, this.state.nodeLookup).then(artist => {
            if (artist) {
                this.updateClickedArtist(artist);
                this.state.camera.setCameraMove(artist.x, artist.y, this.state.camera.getZoomFromWidth(artist.size * 50), 45);
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
        //TODO remove this from here and manage it in sidebar state
        this.setState({fencing: false, fence: [], fenceData: null});

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
                const bubble = newGenre.bubble;
                const camWidth = Math.min(5000, bubble.radius * 4);

                this.state.camera.setCameraMove(bubble.center.x, bubble.center.y,
                                                this.state.camera.getZoomFromWidth(camWidth), 45);

                this.setSidebarState(null, newGenre, {nodes: [], edges: []}, {x: bubble.center.x, y: bubble.center.y, zoom: this.state.camera.getZoomFromWidth(camWidth)}, null);
                this.stateHandler(PageStates.UNKNOWN, PageActions.GENRE, newGenre);
            })
    }

    handleEmptyClick() {
        if (this.state.clickedArtist) {
            this.setSidebarState(null, this.state.activeGenre, this.state.activePath, null, null);
        } else if (this.state.activeGenre) {
            this.setSidebarState(null, null, this.state.activePath, null, null);
        } else {
            this.setSidebarState(null, null, {nodes: [], edges: []}, null, null);
        }

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
        const bubble = fakeGenre.bubble;
        const camWidth = Math.min(5000, bubble.radius * 4);
        const zoom = this.state.camera.getZoomFromWidth(camWidth)
        this.state.camera.setCameraMove(bubble.center.x, bubble.center.y, zoom, 45);

        this.stateHandler(PageStates.SP_DIALOG, PageActions.DEFAULT, {nodes: newPath, edges: newPathEdges});
        this.setSidebarState(null, null, {nodes: newPath, edges: newPathEdges}, {x: bubble.center.x, y: bubble.center.y, zoom: this.state.camera.getZoomFromWidth(camWidth)}, null);
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
        this.state.camera.setCameraMove(0, 0, 1, 30);
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

        this.pushState(url);

        // console.log({
        //     src: srcPage,
        //     action: action,
        //     data: newData,
        //     dest: destPage
        // });

        const lastState = this.state.historyState;
        const newState = new HistoryState(lastState, destPage, newData, url);
        lastState.next = newState;
        this.setState({historyState: newState});
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
        //1. This hash is in our history, which means we can render it
        //2. This hash is not in our history, which means we have to process and create it.
        //3. This hash is our current location, which means we just do nothing

        // Scenario 3
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
        }

        // TODO scenario 1
    }

    componentDidMount() {
        window.addEventListener("hashchange", this.hashChangeHandler);
        if (window.location.hash) {
            this.processHash(window.location.hash);
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

                    sidebarState={this.state.currentSidebarState}
                    undoSidebarState={this.undoSidebarState}
                    redoSidebarState={this.redoSidebarState}

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