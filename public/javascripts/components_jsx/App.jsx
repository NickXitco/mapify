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

        this.setCursor = this.setCursor.bind(this);

        this.keyDownEvents = this.keyDownEvents.bind(this);
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
        if (this.state.uiHover !== value) {
            this.setState({uiHover: value});
        }
    }

    //<editor-fold desc="Clicked Artist Handling">
    updateClickedArtist(artist) {
        if (artist.loaded) {
            this.setSidebarState(artist, this.state.activeGenre, {nodes: [], edges: []}, {x: artist.x, y: artist.y, zoom: this.state.camera.getZoomFromWidth(artist.size * 50)}, null);
        } else if (artist.id) {
            loadArtist(this.state.p5, artist, this.state.quadHead, this.state.nodeLookup).then(() =>{
                    artist = this.state.nodeLookup[artist.id];
                    this.setSidebarState(artist, this.state.activeGenre, {nodes: [], edges: []}, {x: artist.x, y: artist.y, zoom: this.state.camera.getZoomFromWidth(artist.size * 50)}, null);
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
                .then(data => console.log(data));
        }

        this.setState({fencing: state});
    }

    addFencepost(post) {
        const newFence = [...this.state.fence]
        newFence.push(post);
        this.setState({fence: newFence});
    }

    clearFence() {
        this.setState({fence: []});
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
        this.state.camera.setCameraMove(bubble.center.x, bubble.center.y,
            this.state.camera.getZoomFromWidth(camWidth), 45);

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

        let colorant = this.state.clickedArtist ? this.state.clickedArtist : this.state.activeGenre ? this.state.activeGenre : this.state.activePath.nodes.length > 0 ? this.state.activePath.nodes[0] : null;

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
                    artist={this.state.clickedArtist}
                    genre={this.state.activeGenre}
                    path={this.state.activePath.nodes}

                    sidebarState={this.state.currentSidebarState}
                    undoSidebarState={this.undoSidebarState}
                    redoSidebarState={this.redoSidebarState}

                    loadArtistFromUI={this.loadArtistFromUI}
                    loadGenreFromSearch={this.loadGenreFromSearch}
                    updateHoveredArtist={this.updateHoveredArtist}
                    updateHoverFlag={this.updateHoverFlag}
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
                    clickedArtist={this.state.clickedArtist}
                    path={this.state.activePath}

                    genre={this.state.activeGenre}

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

                    fence={this.state.fence}
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