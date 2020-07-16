class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            canvas: null,
            p5: null,
            camera: null,

            hoveredArtist: null,
            clickedArtist: null,

            activeGenre: null,

            quadHead: null,

            nodeLookup: {},
            nodeOccurences: {},

            timingEvents: {},
            lastTime: 0,

            uiHover: false
        }

        this.canvasUpdate = this.canvasUpdate.bind(this);

        this.updateClickedArtist = this.updateClickedArtist.bind(this);
        this.unsetClickedArtist = this.unsetClickedArtist.bind(this);

        this.loadArtistFromUI = this.loadArtistFromUI.bind(this);
        this.loadArtistFromSearch = this.loadArtistFromSearch.bind(this);

        this.updateHoveredArtist = this.updateHoveredArtist.bind(this);

        this.updateHoverFlag = this.updateHoverFlag.bind(this);

        this.loadGenreFromSearch = this.loadGenreFromSearch.bind(this);
    }

    updateHoverFlag(value) {
        if (this.state.uiHover !== value) {
            this.setState({uiHover: value});
        }
    }


    //<editor-fold desc="Clicked Artist Handling">
    updateClickedArtist(artist) {
        console.log(artist);
        if (artist.loaded) {
            this.setState({clickedArtist: artist});
        } else if (artist.id) {
            loadArtist(p, artist, quadHead, nodeLookup).then(() =>{
                    artist.edges = [];
                    this.setState({clickedArtist: nodeLookup[artist.id]});
            });
        }
    }

    loadArtistFromUI(artist) {
        if (artist.loaded) {
            this.setState({clickedArtist: artist});
        } else {
            fetch(`artist/${artist.id}/true`)
                .then(response => response.json())
                .then(data => {
                    const node = createNewNode(data, quadHead, nodeLookup);
                    for (const r of data.related) {
                        node.relatedVertices.add(createNewNode(r, quadHead, nodeLookup));
                    }
                    node.loaded = true;
                    this.setState({clickedArtist: node});
                    node.edges = [];
                })
        }
        camera.setCameraMove(artist.x, artist.y, camera.getZoomFromWidth(artist.size * 50), 30);
    }

    loadArtistFromSearch(searchTerm) {
        loadArtistFromSearch(p, searchTerm, false, quadHead, nodeLookup).then(node => {
            console.trace(node);
            if (node) {
                this.setState({clickedArtist: node});
                node.edges = [];
                camera.setCameraMove(node.x, node.y, camera.getZoomFromWidth(node.size * 50), 30);
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
                    createNewNode(node, quadHead, nodeLookup);
                    nodesList.push(nodeLookup[node.id]);
                }

                const nodes = new Set(nodesList);

                const newGenre = new Genre(name, nodes, r, g, b);


                camera.setCameraMove(newGenre.centroid.x, newGenre.centroid.y,
                                     camera.getZoomFromWidth(newGenre.getWidth()), 30);

                this.setState({clickedArtist: null, activeGenre: newGenre});
            })
    }



    unsetClickedArtist() {
        this.setState({clickedArtist: null});
    }

    updateHoveredArtist(artist) {
        if (this.state.hoveredArtist !== artist) {
            this.setState({hoveredArtist: artist});
        }
    }

    canvasUpdate(canvas) {
        this.setState({canvas: canvas})
        this.initializeResizeObserver()
    }

    initializeResizeObserver() {
        this.ro = new ResizeObserver(entries => {
            if (entries.length !== 1) {
                console.log("I don't know what this is");
            } else {
                const cr = entries[0].contentRect;
                const w = cr.width;
                const h = cr.height;
                if (p) {
                    p.resizeCanvas(w,h);
                }
                camera.zoomCamera({x: camera.x, y: camera.y});
            }
        })
        this.ro.observe(document.getElementById("root"));
    }

    render() {
        console.log("Rendering!");
        return (
            <div className={"fullScreen"}>
                <ReactInfobox artist={this.state.hoveredArtist}/>

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
                    canvasUpdate={this.canvasUpdate}

                    hoveredArtist={this.state.hoveredArtist}
                    clickedArtist={this.state.clickedArtist}

                    uiHover={this.state.uiHover}
                    updateHoverFlag={this.updateHoverFlag}

                    updateClickedArtist={this.updateClickedArtist}
                    unsetClickedArtist={this.unsetClickedArtist}
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