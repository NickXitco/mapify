class HopsList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.path.length === 0) {
            return null;
        }

        const artists = this.props.path.map((artist, index) =>
            <li className={"hopListItem"}
                key={artist.id.toString()}
                onClick={() => {this.props.loadArtistFromUI(artist)}}
                onMouseEnter={() => {this.props.updateHoveredArtist(artist)}}
                onMouseLeave={() => {this.props.updateHoveredArtist(null)}}
            >
                <span style={{position: 'static', fontWeight: 700, fontSize: '24px'}}>
                    {`${index + 1}.`}
                </span>
                {` ${artist.name.toString()}`}
            </li>
        );


        return (
            <div className={"relatedArtistsSection"}>
                <h2>{this.props.header}</h2>
                <ol className={"relatedArtistsList"}>
                    {artists}
                </ol>
            </div>
        )
    }

}