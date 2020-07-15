class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            canvas: null,
            p5: null,
            camera: null,

            hoveredArtist: null,
            clickedArtist: null,
            zoomArtist: null,

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

        this.updateClickedGenre = this.updateClickedGenre.bind(this);
        this.processSearchSubmit = this.processSearchSubmit.bind(this);

        this.updateHoveredArtist = this.updateHoveredArtist.bind(this);

        this.updateHoverFlag = this.updateHoverFlag.bind(this);

    }

    updateHoverFlag(value) {
        this.setState({uiHover: value});
    }

    updateClickedArtist(artist) {
        console.log(artist);
        if (artist.loaded) {
            this.setState({clickedArtist: artist});
        } else if (artist.id) {
            loadArtist(p, artist, quadHead, nodeLookup).then(() =>{
                    this.setState({clickedArtist: nodeLookup[artist.id]});
            });
        }
    }

    unsetClickedArtist() {
        this.setState({clickedArtist: null});
    }

    updateHoveredArtist(artist) {
        if (this.state.hoveredArtist !== artist) {
            this.setState({hoveredArtist: artist});
        }
    }

    updateClickedGenre(genre) {
        console.log(genre);
    }

    processSearchSubmit(value) {
        console.trace(value);
        loadArtistFromSearch(p, value, false, quadHead, nodeLookup).then(node => {
            console.trace(node);
            if (node) {
                this.setState({clickedArtist: node});
            }
        });
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
                })
        }

        camera.setCameraMove(artist.x, artist.y, camera.getZoomFromWidth(artist.size * 50), 30);
    }

    loadArtistFromSearch(searchTerm) {
        loadArtistFromSearch(p, searchTerm, false, quadHead, nodeLookup).then(node => {
            console.trace(node);
            if (node) {
                this.setState({clickedArtist: node});
                camera.setCameraMove(node.x, node.y, camera.getZoomFromWidth(node.size * 50), 30);
            }
        });
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
                    type={"artist"}
                    artist={this.state.clickedArtist}
                    updateClickedGenre={this.updateClickedGenre}
                    updateClickedArtist={this.updateClickedArtist}
                    updateHoverFlag={this.updateHoverFlag}
                />

                <ReactSearchBox
                    artist={this.state.clickedArtist}
                    updateClickedArtist={this.updateClickedArtist}
                    processSearchSubmit={this.processSearchSubmit}
                    updateHoverFlag={this.updateHoverFlag}
                />

                <P5Wrapper
                    canvasUpdate={this.canvasUpdate}

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