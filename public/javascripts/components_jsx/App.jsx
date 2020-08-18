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

            showChangelog: !this.checkVersion("0.5.3"),
            version: "0.5.3",
            headline: "Searching, revamped",
            changes: [
                "Search suggestions now look better when longer names come up",
                "You can now hover over an artist from search suggestions",
                "Searching algorithm completely overhauled to use Spotify's own search. This should give you more natural results in some cases, as well as cleaning up some edge cases that would come up when you searching things with stopwords (the, a, an, etc.). You can now search for the band \"The The\" and it will actually work!",
                "Fixed some buggy artist name sizes on the sidebar (Madeon, for example)",
                "Added every artist's picture to the sidebar!",
                "Fixed the hover infobox to load with the right size every time.",
                "Hover infobox now has a max width, and will wrap text if an artists' name is too long (The World is a Beautiful Place and I Am No Longer Afraid to Die, for example)",
                "Removed from debug shapes from the genre fence",
                "Made sidebar/color easing much nicer",
            ],
            upcomingFeatures: [
                "Play artists' songs from inside the sidebar",
                "Add actual UI to the app",
                "Add previous versions to this changelog!"
            ]
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
            this.setSidebarState(artist, this.state.activeGenre, null, null);
        } else if (artist.id) {
            loadArtist(this.state.p5, artist, this.state.quadHead, this.state.nodeLookup).then(() =>{
                    artist = this.state.nodeLookup[artist.id];
                    this.setSidebarState(artist, this.state.activeGenre, null, null);
            });
        }
    }

    setSidebarState(artist, genre, path, state) {
        if (artist) {
            artist.edges = makeEdges(artist);
        }

        if (!state && (artist || genre || path)) {
            state = new SidebarState({artist: artist, genre: genre, path: path}, this.state.currentSidebarState);
        }

        this.setState({
            clickedArtist: artist,
            activeGenre: genre,
            activePath: {nodes: [], edges: []},
            currentSidebarState: state
        });
    }

    undoSidebarState() {
        if (this.state.currentSidebarState && this.state.currentSidebarState.canUndo()) {
            const newSidebarState = this.state.currentSidebarState.undo();
            this.setSidebarState(newSidebarState.payload.artist, newSidebarState.payload.genre, newSidebarState.payload.path, newSidebarState);
        }
    }

    redoSidebarState() {
        if (this.state.currentSidebarState && this.state.currentSidebarState.canRedo()) {
            const newSidebarState = this.state.currentSidebarState.redo();
            this.setSidebarState(newSidebarState.payload.artist, newSidebarState.payload.genre, newSidebarState.payload.path, newSidebarState);
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

                this.setSidebarState(null, newGenre, null, null);
            })
    }

    handleEmptyClick() {

        if (this.state.clickedArtist) {
            this.setSidebarState(null, this.state.activeGenre, this.state.activePath, null);
        } else if (this.state.activeGenre) {
            this.setSidebarState(null, null, this.state.activePath, null);
        } else {
            this.setSidebarState(null, null, null, null);
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

        this.setState({activePath: {nodes: newPath, edges: newPathEdges}});
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
                console.log(data);
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

        return (
            <div className={"fullScreen"}>
                {changelog}

                <ShortestPathDialog
                    colorant={this.state.clickedArtist ? this.state.clickedArtist : this.state.activeGenre}
                    expanded={this.state.spButtonExpanded}
                    updateHoverFlag={this.updateHoverFlag}
                    clickHandler={this.expandSP}
                    createNodesFromSuggestions={this.createNodesFromSuggestions}
                    updateHoveredArtist={this.updateHoveredArtist}
                    getArtistFromSearch={this.getArtistFromSearch}
                    updatePath={this.updatePath}
                />

                <RandomNodeButton
                    colorant={this.state.clickedArtist ? this.state.clickedArtist : this.state.activeGenre}
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
                        colorant={this.state.clickedArtist ? this.state.clickedArtist : this.state.activeGenre}

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
                        colorant={this.state.clickedArtist ? this.state.clickedArtist : this.state.activeGenre}

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
                />
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);