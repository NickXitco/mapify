class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            canvas: null,
            p5: null,
            camera: null,

            hoveredArtist: null,
            clickedArist: null,

            quadHead: null,

            nodeLookup: {},
            nodeOccurences: {},

            timingEvents: {},
            lastTime: 0,

            testArtist: null,

            searchResults: [],

            wobblyState: 0
        }

        this.canvasUpdate = this.canvasUpdate.bind(this);
        this.updateClickedArtist = this.updateClickedArtist.bind(this);

    }

    updateClickedArtist(artist) {
        this.setState({testArtist: artist});
        this.setState({wobblyState: 1});
    }

    canvasUpdate(canvas) {
        this.setState({canvas: canvas});
        this.ro = new ResizeObserver(entries => {
            if (entries.length !== 1) {
                console.log("I don't know what this is");
            } else {
                const cr = entries[0].contentRect;
                const w = cr.width;
                const h = cr.height;
                console.log(w);
                console.log(h);
                if (p) {
                    p.resizeCanvas(w,h);
                }
                camera.zoomCamera({x: camera.x, y: camera.y});
            }
        })
        this.ro.observe(document.getElementById("root"));
        this.setState({testArtist: new Artist(
            {name: "TestArtist", id: "6", followers: 2000, popularity: 5, x: 50, y: 50, size: 20,
                r: 25, g: 255, b: 50,
                genres: ["pop"],
                relatedIDS: [],
                relatedVertices: [],
                quad: null,
                loaded: true
            })
            })
    }


    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        console.log(this.state);
        console.log("Doing a render!");
        return (
            <div className={"fullScreen"}>
                <ReactSidebar type={"artist"} artist={this.state.testArtist}/>
                <ReactSearchBox results={this.state.searchResults}/>
                <P5Wrapper canvasUpdate={this.canvasUpdate} updateArtist={this.updateClickedArtist} wobblyState={this.state.wobblyState}/>
            </div>
        );
    }
}

/*

So here's the plan as I see it.

We have an App component that holds:
    -Info Box
    -Search Box
    -Sidebar
    -Future UI
    -THE CANVAS :O

    The app holds all (or as many as we can manage) global variables in its state.
 */

ReactDOM.render(
    <App />,
    document.getElementById('root')
);