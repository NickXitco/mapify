class AdaptablePlayer extends React.Component {
    timerID
    constructor(props) {
        super(props);

        this.state = {
            showingSpotifyPlayer: false
        }

        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        this.tick();
        this.timerID = setInterval(
            () => this.tick(),
            100
        );
    }

    tick() {
        if (player && !this.state.showingSpotifyPlayer) {
            this.setState({showingSpotifyPlayer: true});
        }
    }

    render() {
        const colorant = new Colorant(this.props.artist.r, this.props.artist.g, this.props.artist.b, true);

        if (player) {
            clearInterval(this.timerID);
            return <SidebarSpotifyPlayer tracks={this.props.tracks} colorant={colorant}/>
        } else {
            return <WidgetPlayer tracks={this.props.tracks}/>
        }
    }

}