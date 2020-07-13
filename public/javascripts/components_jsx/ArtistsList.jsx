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
            <li className={"sidebarListItem"} key={artist.id.toString()}>{artist.name.toString()}</li>
        );


        return (
            <div className={"relatedArtistsSection"}>
                <h2>Related Artists</h2>
                <ul className={"relatedArtistsList"}>
                    {artists}
                </ul>
            </div>
        )
    }
}