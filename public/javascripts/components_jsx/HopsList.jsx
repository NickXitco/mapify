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
                <ArtistProfile artist={artist} fontDecrement={3}/>
            </li>
        );


        return (
            <div className={"hopListSection"}>
                <ol className={"hopList"}>
                    {artists}
                </ol>
            </div>
        )
    }

}