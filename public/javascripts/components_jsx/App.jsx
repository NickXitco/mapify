class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            canvas: null,
            p5: null,
            loading: true,
            camera: null,

            hoveredArtist: null,
            clickedLoading: false,
            clickedArist: null,

            darkenOpacityT: 0,

            quadHead: null,
            unproccessResponses: [],

            unloadedQuads: new Set(),
            loadingQuads: new Set(),
            unloadedQuadsPriorityQueue: new PriorityQueue((a, b) => Utils.dist(this.state.camera.x, this.state.camera.y, a.x, a.y) - Utils.dist(this.state.camera.x, this.state.camera.y, b.x, b.y)),

            newEdges: true,
            edges: [],

            nodeLookup: {},
            nodeOccurences: {},

            timingEvents: {},
            lastTime: 0
        }

        this.canvasUpdate = this.canvasUpdate.bind(this);

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
    }


    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className={"fullScreen"}>
                <P5Wrapper canvasUpdate={this.canvasUpdate}/>
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