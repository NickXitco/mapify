class WidgetPlayer extends React.Component {
    render() {
        const playerType = 'track';
        const id = this.props.tracks[0].id;

        const src = `https://open.spotify.com/embed/${playerType}/${id}`

        return (
            <div style={{position: 'static'}}>
                <iframe
                    src={src}
                    className="player"
                    width="406"
                    height="80"
                    frameBorder="0"
                    allow="encrypted-media"
                />
                <p style={{padding: "10px 22px", fontSize: "12px"}}>Headphone warning, this can be pretty loud</p>
            </div>
        )
    }
}