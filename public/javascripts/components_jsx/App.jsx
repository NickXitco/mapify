class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            canvas: null,
            p5: null,
            camera: null,

            hoveredArtist: null,
            clickedArtist: null,

            quadHead: null,

            nodeLookup: {},
            nodeOccurences: {},

            timingEvents: {},
            lastTime: 0,

            testArtist: null,

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


    canvasUpdate(canvas) {
        this.setState({canvas: canvas,
                       clickedArtist: new Artist(
                        {name: "TestArtist", id: "6", followers: 2000, popularity: 5, x: 50, y: 50, size: 20,
                            r: 25, g: 255, b: 50,
                            genres: ["pop"],
                            relatedIDS: [],
                            relatedVertices: [],
                            quad: null,
                            loaded: true
                            }
                        )
                    })
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

                <ReactSidebar type={"artist"}
                              artist={this.state.clickedArtist}
                              updateClickedGenre={this.updateClickedGenre}
                              updateClickedArtist={this.updateClickedArtist}
                />

                <ReactSearchBox
                    artist={this.state.clickedArtist}
                    updateClickedArtist={this.updateClickedArtist}
                    processSearchSubmit={this.processSearchSubmit}
                    updateHoverFlag={this.updateHoverFlag}
                />

                <P5Wrapper
                    canvasUpdate={this.canvasUpdate}
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