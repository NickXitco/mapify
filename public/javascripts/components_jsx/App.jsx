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

            uiHover: false
        }

        this.setCanvas = this.setCanvas.bind(this);
        this.setCamera = this.setCamera.bind(this);

        this.updateClickedArtist = this.updateClickedArtist.bind(this);
        this.handleEmptyClick = this.handleEmptyClick.bind(this);

        this.loadArtistFromUI = this.loadArtistFromUI.bind(this);
        this.loadArtistFromSearch = this.loadArtistFromSearch.bind(this);

        this.updateHoveredArtist = this.updateHoveredArtist.bind(this);
        this.updateHoverPoint = this.updateHoverPoint.bind(this);

        this.updateHoverFlag = this.updateHoverFlag.bind(this);

        this.loadGenreFromSearch = this.loadGenreFromSearch.bind(this);
        this.setQuadHead = this.setQuadHead.bind(this);
    }

    updateHoverFlag(value) {
        if (this.state.uiHover !== value) {
            this.setState({uiHover: value});
        }
    }


    //<editor-fold desc="Clicked Artist Handling">
    updateClickedArtist(artist) {
        if (artist.loaded) {
            artist.edges = makeEdges(artist);
            this.setState({clickedArtist: artist});
        } else if (artist.id) {
            loadArtist(this.state.p5, artist, this.state.quadHead, this.state.nodeLookup).then(() =>{
                    artist = this.state.nodeLookup[artist.id];
                    artist.edges = makeEdges(artist);
                    this.setState({clickedArtist: artist});
            });
        }
    }

    loadArtistFromUI(artist) {
        this.updateClickedArtist(artist);
        this.state.camera.setCameraMove(artist.x, artist.y, this.state.camera.getZoomFromWidth(artist.size * 50), 45);
    }

    loadArtistFromSearch(searchTerm) {
        loadArtistFromSearch(this.state.p5, searchTerm, false, this.state.quadHead, this.state.nodeLookup).then(artist => {
            console.trace(artist);
            if (artist) {
                this.updateClickedArtist(artist);
                this.state.camera.setCameraMove(artist.x, artist.y, this.state.camera.getZoomFromWidth(artist.size * 50), 45);
            }
        });
    }
    //</editor-fold>

    loadGenreFromSearch(genreName) {
        fetch(`genre/${genreName}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
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

                const newGenre = new Genre(name, nodes, r, g, b);
                const bubble = newGenre.bubble;
                const camWidth = Math.min(5000, bubble.radius * 4);

                this.state.camera.setCameraMove(bubble.center.x, bubble.center.y,
                                                this.state.camera.getZoomFromWidth(camWidth), 45);

                this.setState({clickedArtist: null, activeGenre: newGenre});
            })
    }

    /**
     *                 artist
     *                0     |     1
     *          |-------------------------
     *        0 | both null | both null
     * genre    |--------------------------
     *        1 | both null | artist null,
     *          |           | genre unchanged
     *
     */
    handleEmptyClick() {
        if (!(this.state.activeGenre && this.state.clickedArtist)) {
            this.setState({activeGenre: null});
        }
        this.setState({clickedArtist: null});
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

    setCanvas(p5) {
        this.setState({p5: p5}, () => {
            console.log('P5 Set state callback');
            console.log(window.innerWidth);
        });
        this.initializeResizeObserver();
    }

    setCamera(camera) {
        this.setState({camera: camera}, () => {
            console.log('Camera Set state callback');
            console.log(window.innerWidth);
            this.state.camera.zoomCamera({x: 0, y: 0});
        })
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
        console.log("Rendering!");
        return (
            <div className={"fullScreen"}>
                <ReactInfobox
                    artist={this.state.hoveredArtist}
                    point={this.state.hoverPoint}
                />

                <ReactSidebar
                    artist={this.state.clickedArtist}
                    genre={this.state.activeGenre}

                    loadArtistFromUI={this.loadArtistFromUI}
                    loadGenreFromSearch={this.loadGenreFromSearch}
                    updateHoveredArtist={this.updateHoveredArtist}

                    updateHoverFlag={this.updateHoverFlag}
                />

                <ReactSearchBox
                    artist={this.state.clickedArtist}
                    loadArtistFromUI={this.loadArtistFromUI}
                    loadArtistFromSearch={this.loadArtistFromSearch}
                    updateHoverFlag={this.updateHoverFlag}
                />

                <P5Wrapper
                    hoveredArtist={this.state.hoveredArtist}
                    clickedArtist={this.state.clickedArtist}

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