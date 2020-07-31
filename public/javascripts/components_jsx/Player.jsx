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
            <iframe
                src={src}
                width="300"
                height="80"
                frameBorder="0"
                allowTransparency="true"
                allow="encrypted-media"
            />
        )
    }
}