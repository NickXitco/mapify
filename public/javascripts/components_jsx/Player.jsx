class Player extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        const uriSplit = this.props.uri.split(":");
        if (uriSplit.length !== 3) {
            return null;
        }

        const playerType = uriSplit[1];
        const id = uriSplit[2];

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