class SidebarSpotifyPlayer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            firstTrack: props.tracks.length > 0 ? props.tracks[0] : null,
            live: false,
            paused: false
        }
    }

    render() {
        const colorant = this.props.colorant;
        return (
            <SpotifyPlayer
                updateHoverFlag={() => {}}
                colorant={colorant}
                width={'410px'}
                live={false}
                artControls={true}
                trackQueue={this.props.tracks}
                volume={false}
                defaultSongID={this.props.tracks[0].id}
            />
        );
    }

}