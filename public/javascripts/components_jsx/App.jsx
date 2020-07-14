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

            searchResults: [],
        }

        this.canvasUpdate = this.canvasUpdate.bind(this);
        this.updateClickedArtist = this.updateClickedArtist.bind(this);
        this.updateClickedGenre = this.updateClickedGenre.bind(this);

    }

    updateClickedArtist(artist) {
        console.log(artist);
        this.setState({clickedArtist: artist});
    }

    updateClickedGenre(genre) {
        console.log(genre);
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


    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className={"fullScreen"}>
                <ReactInfobox artist={this.state.clickedArtist}/>

                <ReactSidebar type={"artist"}
                              artist={this.state.clickedArtist}
                              updateClickedGenre={this.updateClickedGenre}
                              updateClickedArtist={this.updateClickedArtist}
                />

                <ReactSearchBox
                    artist={this.state.clickedArtist}
                    results={this.state.searchResults}
                />

                <P5Wrapper
                    canvasUpdate={this.canvasUpdate}
                    updateArtist={this.updateClickedArtist}
                    wobblyState={this.state.wobblyState}
                />
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);