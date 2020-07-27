class ArtistsList extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        if (this.props.artists.size === 0) {
            return null;
        }

        const relatedArray = [...this.props.artists]

        const artists = relatedArray.map(artist =>
            <li className={"sidebarListItem"}
                key={artist.id.toString()}
                onClick={() => {this.props.loadArtistFromUI(artist)}}

                //TODO When you check this in the draw loop, just see if UI hover is on, if so, turn off all edges
                //except this one
                onMouseEnter={() => {this.props.updateHoveredArtist(artist)}}
                onMouseLeave={() => {this.props.updateHoveredArtist(null)}}
            >
                {artist.name.toString()}
            </li>
        );


        return (
            <div className={"relatedArtistsSection"}>
                <h2>{this.props.header}</h2>
                <ul className={"relatedArtistsList"}>
                    {artists}
                </ul>
            </div>
        )
    }
}