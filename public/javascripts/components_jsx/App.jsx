class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            canvas: null,
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
            settingsButtonExpanded: false,

            activePath: null,

            showDebug: false,

            cursor: 'auto',
            historyState: new HistoryState(null, PageStates.HOME, null, "", "The Artist Observatory"),
            loading: false
        }

        this.setCamera = this.setCamera.bind(this);

        this.resetCamera = this.resetCamera.bind(this);
        this.zoomCameraOut = this.zoomCameraOut.bind(this);
        this.zoomCameraIn = this.zoomCameraIn.bind(this);
        this.artistCameraMove = this.artistCameraMove.bind(this);

        this.updateClickedArtist = this.updateClickedArtist.bind(this);

        this.handleEmptyClick = this.handleEmptyClick.bind(this);
        this.handleSPClick = this.handleSPClick.bind(this);
        this.closeSP = this.closeSP.bind(this);
        this.handleSettingsClick = this.handleSettingsClick.bind(this);
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

        this.setFencing = this.setFencing.bind(this);
        this.addFencepost = this.addFencepost.bind(this);
        this.processIntersection = this.processIntersection.bind(this);
        this.clearFence = this.clearFence.bind(this);
        this.setActiveGenreAppearance = this.setActiveGenreAppearance.bind(this);
        this.clearActiveGenreAppearance = this.clearActiveGenreAppearance.bind(this);

        this.setCursor = this.setCursor.bind(this);

        this.flipDebug = this.flipDebug.bind(this);

        this.keyDownEvents = this.keyDownEvents.bind(this);

        this.stateHandler = this.stateHandler.bind(this);
        this.hashChangeHandler = this.hashChangeHandler.bind(this);
        this.pushState = this.pushState.bind(this);
        this.processHash = this.processHash.bind(this);

        this.showAboutPage = this.showAboutPage.bind(this);

        this.startLoading = this.startLoading.bind(this);
        this.stopLoading = this.stopLoading.bind(this);
    }

    updateHoverFlag(value) {
        this.setState({uiHover: value});

        if (value) {
            // Unhover artists
            this.setState({hoveredArtist: null, hoverPoint: {}});
            this.setCursor('auto');
        }
    }

    //<editor-fold desc="Clicked Artist Handling">
    updateClickedArtist(artist) {
        if (artist.loaded) {
            this.stateHandler(PageStates.UNKNOWN, PageActions.ARTIST, artist);
        } else if (artist.id) {
            loadArtist(artist, this.state.quadHead, this.state.nodeLookup).then(() =>{
                    artist = this.state.nodeLookup[artist.id];
                    this.stateHandler(PageStates.UNKNOWN, PageActions.ARTIST, artist);
            });
        }
    }

    setFencing(state, artistIDToBeLoaded) {
        if (state === false && this.state.fence.length > 0) {
            const latLongFence = [];

            const fence = Utils.reduceFence(this.state.fence);

            for (const post of fence) {
                const projection = Utils.gnomicProjection(post.x, post.y, 0, -0.5 * Math.PI, PLANE_RADIUS);
                latLongFence.push(projection);
            }

            this.setState({fence: fence});
            this.startLoading();

            let fakeGenre = new Genre('r', new Set(this.state.fence), 0, 0, 0, 1);
            this.state.camera.bubbleMove(fakeGenre.bubble);

            fetch(`fence`,
                {method: 'POST', headers: {'Content-Type': 'application/json',}, body: JSON.stringify(latLongFence)}
                )
                .then(response => response.json())
                .then(data => {
                    if (typeof data === "string") {
                        console.error(data);
                        this.clearFence();
                        this.stopLoading();
                        return;
                    }
                    data.posts = this.state.fence;

                    const artists = [];
                    for (const artist of data.top100) {
                        artists.push(createNewNode(artist, this.state.quadHead, this.state.nodeLookup));
                    }
                    data.top100 = artists;
                    data.name = Utils.nameShape(data.posts.length);

                    this.stateHandler(PageStates.UNKNOWN, PageActions.REGION, data);
                    this.stopLoading();

                    if (artistIDToBeLoaded) {
                        this.loadArtistFromSearch(artistIDToBeLoaded, true);
                    }
                });
        }

        this.setState({fencing: state});
    }

    addFencepost(post, artistToBeLoadedOnClose) {
        const newFence = [...this.state.fence]
        post.x = Math.round(post.x * 10) / 10;
        post.y = Math.round(post.y * 10) / 10;
        newFence.push(post);
        this.setState({fence: newFence}, () => {
            const firstPoint = this.state.fence[0];
            const lastPoint = this.state.fence[this.state.fence.length - 1];

            if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y && this.state.fence.length > 2) {
                this.setFencing(false, artistToBeLoadedOnClose);
            }
        });
    }

    processIntersection(intersection) {
        const newFence = [];
        const mainPost = {
            x: Math.round(intersection.intersectionPoint.x * 10) / 10,
            y: Math.round(intersection.intersectionPoint.y * 10) / 10
        };
        newFence.push(mainPost);
        for (let i = intersection.vIndex; i < this.state.fence.length; i++) {
            newFence.push(this.state.fence[i]);
        }
        newFence.push(mainPost);
        this.setState({fence: newFence}, () => {
            this.setFencing(false, null);
        });
    }

    clearFence() {
        this.setState({fence: [], fenceData: null, fencing: false});
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
        this.setState({hoveredArtist: null, hoverPoint: {}});
        this.setCursor('auto');
    }

    loadArtistFromSearch(searchTerm, isQueryID) {
        loadArtistFromSearch(searchTerm, isQueryID, this.state.quadHead, this.state.nodeLookup).then(artist => {
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

    loadGenreFromSearch(genreName, artistIDToBeLoaded) {
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

                if (artistIDToBeLoaded) {
                    this.loadArtistFromSearch(artistIDToBeLoaded, true);
                }
            })
    }

    handleEmptyClick() {
        this.stateHandler(PageStates.UNKNOWN, PageActions.MAP, null);
        this.setState({clearSearch: true, spButtonExpanded: false, settingsButtonExpanded: false});
    }

    handleSPClick() {
        this.setState({spButtonExpanded: !this.state.spButtonExpanded});
    }

    closeSP() {
        this.setState({spButtonExpanded: false});
    }

    handleSettingsClick() {
        this.setState({settingsButtonExpanded: !this.state.settingsButtonExpanded});
    }

    startLoading() {
        //TODO maybe add a short ~100ms delay to this function so we don't do jarring loading screens?
        //  You'd have to do this in a smart way as to not be locked in a loading state if the loading takes less
        //  than 100ms, as we'd then set the loading to be true after it was set to false.\\\\\\\\\\\\\\
        this.setState({loading: true});
    }

    stopLoading() {
        this.setState({loading: false});
    }

    updatePath(aID, bID, weighted) {
        this.startLoading();
        fetch(`path/${aID}/${bID}/${weighted}`)
            .then(res => res.json())
            .then(path => {
                const newPath = [];
                for (const hop of path) {
                    const node = createNewNode(hop, this.state.quadHead, this.state.nodeLookup)
                    node.images = hop.images;
                    node.track = hop.track;

                    for (const r of hop.related) {
                        createNewNode(r, this.state.quadHead, this.state.nodeLookup);
                        node.relatedVertices.add(this.state.nodeLookup[r.id]);
                    }

                    newPath.push(node);
                }

                const newPathEdges = [];

                for (let i = 0; i < newPath.length - 1; i++) {
                    newPathEdges.push(makeEdge(newPath[i], newPath[i + 1]));
                }

                const fakeGenre = new Genre('sp', new Set(newPath), 0, 0, 0, 1);
                this.state.camera.bubbleMove(fakeGenre.bubble);
                this.stopLoading();
                this.closeSP();
                this.stateHandler(PageStates.SP_DIALOG, PageActions.DEFAULT, {nodes: newPath, edges: newPathEdges, weighted: weighted});
            });
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
        this.startLoading();
        fetch(`random`)
            .then(response => response.json())
            .then(data => {
                this.stopLoading();
                loadArtist(data, this.state.quadHead, this.state.nodeLookup).then(() =>{
                    this.loadArtistFromUI(this.state.nodeLookup[data.id]);
                });
            });
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

    artistCameraMove(artist) {
        this.state.camera.artistMove(artist);
    }

    setQuadHead(quadHead) {
        this.setState({quadHead: quadHead});
    }


    setCursor(cursor) {
        if (cursor !== this.state.cursor) {
            this.setState({cursor: cursor})
        }
    }

    flipDebug(state) {
        this.setState({showDebug: state});
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
        let title = "The Artist Observatory";

        if (destPage === PageStates.ARTIST) {
            url = `a=${newData.id}`
            title = `${newData.name} | The Artist Observatory`;
        } else if (destPage === PageStates.GENRE) {
            url = `g=${encodeURIComponent(newData.name)}`;
            title = `${newData.name.toUpperCase()} | The Artist Observatory`;
        } else if (destPage === PageStates.PATH) {
            url = `p=${newData.nodes[0].id},${newData.nodes[newData.nodes.length - 1].id},${newData.weighted ? "weighted" : "unweighted"}`;
            title = `${newData.nodes[0].name} to ${newData.nodes[newData.nodes.length - 1].name} | The Artist Observatory`;
        } else if (destPage === PageStates.REGION) {
            url = `r=${Utils.regionToString(newData.posts)}`
            title = `Region Selection | The Artist Observatory`;
        } else if (destPage === PageStates.REGION_ARTIST) {
            url = `r=${Utils.regionToString(newData.region.posts)}&a=${newData.artist.id}`;
            title = `${newData.artist.name} | Region Selection | The Artist Observatory`;
        } else if (destPage === PageStates.GENRE_ARTIST) {
            url = `g=${encodeURIComponent(newData.genre.name)}&a=${newData.artist.id}`;
            title = `${newData.artist.name} | ${newData.genre.name.toUpperCase()} | The Artist Observatory`;
        } else if (destPage === PageStates.ABOUT) {
            url= `about`;
            title = `About | The Artist Observatory`;
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

        this.pushState(url, title);

        const lastState = this.state.historyState;
        const newState = new HistoryState(lastState, destPage, newData, url, title);
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

    pushState(url, title) {
        window.location.hash = url;
        document.title = title;
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

        // Scenario 2
        let current = this.state.historyState.prev;
        let newState;
        while (current) {
            if (current.url === hash) {
                newState = current;
                break;
            }
            current = current.prev;
        }

        if (newState) {
            newState.detachSelf();
            const lastState = this.state.historyState;
            newState.prev = lastState;
            newState.next = null;
            lastState.next = newState;
            document.title = newState.title;
            this.setState({historyState: newState});

            switch (newState.page) {
                case PageStates.ARTIST:
                    this.state.camera.artistMove(newState.getData());
                    newState.getData().edges = makeEdges(newState.getData());
                    break;
                case PageStates.REGION_ARTIST:
                    this.state.camera.artistMove(newState.getData().artist);
                    newState.getData().artist.edges = makeEdges(newState.getData().artist);
                    break;
                case PageStates.GENRE_ARTIST:
                    this.state.camera.artistMove(newState.getData().artist);
                    newState.getData().artist.edges = makeEdges(newState.getData().artist);
                    newState.getData().genre.graphics = new PIXI.Graphics();
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
                    newState.getData().graphics = new PIXI.Graphics();
                    break;
                case PageStates.REGION:
                    this.state.camera.bubbleMove(
                        new Genre(
                            'sp', new Set(newState.getData().top100), 0, 0, 0, 1
                        ).bubble
                    );
                    break;
                default:
                    //this.state.camera.reset(30);
                    break;
            }

            return;
        }

        // Scenario 3
        const validatedHash = this.validateHash(hash);

        if (!validatedHash) {
            this.stateHandler(PageStates.UNKNOWN, PageActions.MAP, null);
            this.resetCamera();
            return
        }

        let coordinates;
        switch (validatedHash.page) {
            case PageStates.ARTIST:
                this.loadArtistFromSearch(validatedHash.data.artist, true);
                break;
            case PageStates.GENRE:
                this.loadGenreFromSearch(validatedHash.data.genre, null);
                break;
            case PageStates.REGION:
                coordinates = validatedHash.data.region.split(",");
                for (let i = 0; i < coordinates.length - 1; i += 2) {
                    this.addFencepost({x: Number(coordinates[i]), y: Number(coordinates[i + 1])}, null);
                }
                break;
            case PageStates.PATH:
                const ids = validatedHash.data.path.split(",");
                this.updatePath(ids[0], ids[1], ids[2]);
                break;
            case PageStates.REGION_ARTIST:
                coordinates = validatedHash.data.region.split(",");
                for (let i = 0; i < coordinates.length - 1; i += 2) {
                    this.addFencepost({x: Number(coordinates[i]), y: Number(coordinates[i + 1])}, validatedHash.data.artist);
                }
                break;
            case PageStates.GENRE_ARTIST:
                this.loadGenreFromSearch(validatedHash.data.genre, validatedHash.data.artist);
                break;
            case PageStates.ABOUT:
                this.showAboutPage();
                break;
        }
    }

    validateHash(hash) {
        const hashSplit = hash.split(/[&=]+/);
        const validatedHash = {numParams: hashSplit.length / 2, page: "", data: {}};

        if (hashSplit.length === 1 && hashSplit[0] === "about") {
            validatedHash.page = PageStates.ABOUT;
            return validatedHash;
        }

        const MAX_PARAMS = 2;
        if (hashSplit.length < 2 || hashSplit.length > MAX_PARAMS * 2 || hashSplit.length % 2 !== 0) {
            return null;
        }

        for (let i = 0; i < hashSplit.length / 2; i++) {
            const param = hashSplit[i * 2];
            if (i > 1 && param !== "a") return null;
            if (i === 0 && hashSplit.length > 2 && (param !== "g" && param !== "r")) return null;

            const value = hashSplit[i * 2 + 1];
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
                    const split = value.split(",");
                    for (const num of split) {
                        if (isNaN(Number(num))) return null;
                    }
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

    showAboutPage() {
        this.stateHandler(PageStates.UNKNOWN, PageActions.ABOUT, null);
    }

    componentDidMount() {
        window.addEventListener("hashchange", this.hashChangeHandler);
        window.addEventListener('keydown', this.keyDownEvents)
    }

    render() {
        const historyState = this.state.historyState;

        let clickedArtist = null;
        let activePath = null;
        let activeGenre = this.state.activeGenre; // This is needed for genre hover in region
        let fence = this.state.fence; // This is needed for active fence drawing
        let colorant = new Colorant(255, 255, 255, false);

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
                if (!g) {
                    colorant = new Colorant(0, 0, 0, true);
                } else {
                    colorant = new Colorant(g.r, g.g, g.b, true);
                }
                break;
            default:
        }

        let cursorStyle = {
            cursor: this.state.cursor
        }

        return (
            <div className={"fullScreen"} style={cursorStyle}>
                {changelog}

                <Logo colorant={colorant}/>
                <p className={"version"}>{this.state.version}</p>

                <div className={"buttons"}>
                    <RandomNodeButton
                        colorant={colorant}
                        updateHoverFlag={this.updateHoverFlag}
                        clickHandler={this.fetchRandomArtist}
                    />

                    <ShortestPathDialog
                        colorant={colorant}
                        expanded={this.state.spButtonExpanded}
                        updateHoverFlag={this.updateHoverFlag}
                        clickHandler={this.handleSPClick}
                        closeSP={this.closeSP}
                        createNodesFromSuggestions={this.createNodesFromSuggestions}
                        updateHoveredArtist={this.updateHoveredArtist}
                        getArtistFromSearch={this.getArtistFromSearch}
                        updatePath={this.updatePath}
                    />

                    <SettingsButton
                        colorant={colorant}
                        expanded={this.state.settingsButtonExpanded}
                        updateHoverFlag={this.updateHoverFlag}
                        clickHandler={this.handleSettingsClick}
                        flipDebug={this.flipDebug}
                    />

                    <LeftSideButton
                        colorant={colorant}
                        updateHoverFlag={this.updateHoverFlag}
                        clickHandler={this.showAboutPage}

                        icon={ICONS.about}
                        heading={"about"}
                    />
                </div>

                <ReactInfobox
                    artist={this.state.hoveredArtist}
                    point={this.state.hoverPoint}
                />

                <ReactSidebar
                    historyState={this.state.historyState}
                    uiHover={this.state.uiHover}
                    loading={this.state.loading}

                    loadArtistFromUI={this.loadArtistFromUI}
                    loadGenreFromSearch={this.loadGenreFromSearch}
                    updateHoveredArtist={this.updateHoveredArtist}
                    updateHoverFlag={this.updateHoverFlag}
                    setActiveGenreAppearance={this.setActiveGenreAppearance}
                    clearActiveGenreAppearance={this.clearActiveGenreAppearance}
                    moveCamera={this.artistCameraMove}
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

                <PIXIWrapper
                    hoveredArtist={this.state.hoveredArtist}

                    clickedArtist={clickedArtist}
                    path={activePath}
                    genre={activeGenre}
                    fence={fence}

                    nodeLookup={this.state.nodeLookup} //TODO consider removing this from P5 and do all load handling at the app level.
                    quadHead={this.state.quadHead}
                    camera={this.state.camera}

                    setQuadHead={this.setQuadHead}
                    setCanvas={this.setCanvas}
                    setCamera={this.setCamera}
                    processHash={this.processHash}

                    uiHover={this.state.uiHover}
                    updateHoverFlag={this.updateHoverFlag}

                    updateClickedArtist={this.updateClickedArtist}
                    handleEmptyClick={this.handleEmptyClick}
                    updateHoveredArtist={this.updateHoveredArtist}

                    setCursor={this.setCursor}

                    setFencing={this.setFencing}
                    addFencepost={this.addFencepost}
                    processIntersection={this.processIntersection}
                    clearFence={this.clearFence}
                    fencing={this.state.fencing}

                    showDebug={this.state.showDebug}
                />
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);