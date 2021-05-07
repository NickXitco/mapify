class HopsList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            openedArtist: null
        }

        this.openArtist = this.openArtist.bind(this);
    }

    openArtist(artist) {
        this.setState({openedArtist: artist});
    }

    render() {
        if (this.props.path.length === 0) {
            return null;
        }

        const artists = this.props.path.map((artist, index) => {
            let line;

            if (index === this.props.path.length - 1) {
                line = null;
            } else {
                line = (
                    <div
                        style={{
                            position: 'absolute',
                            background: `linear-gradient(180deg, ${artist.colorToString()}, ${this.props.path[index + 1].colorToString()})`,
                            height: '100%',
                            width: '2px',
                            marginLeft: '62px',
                            marginTop: '-23px',
                            marginBottom: '-33px',
                        }}
                    />
                )
            }


            let expandClass = artist === this.state.openedArtist ? "pathArtistDetailsOpen" : "pathArtistDetailsClosed";

            let artistExpand = (
                        <div className={`pathArtistDetails ${expandClass}`}>
                            <GenresList genres={artist.genres}
                                        loadGenreFromSearch={this.props.loadGenreFromSearch}
                                        header={"Genres"}
                            />

                            <ArtistsList artists={artist.relatedVertices}
                                         loadArtistFromUI={this.props.loadArtistFromUI}
                                         updateHoveredArtist={this.props.updateHoveredArtist}
                                         header={"Related Artists"}
                                         color={artist.colorToString()}
                            />
                        </div>
                    )

            return (
                <li className={"hopListItem"}
                    key={artist.id.toString()}
                    onClick={() => {
                        this.openArtist(artist)
                    }}
                    onMouseEnter={() => {
                        this.props.updateHoveredArtist(artist)
                    }}
                    onMouseLeave={() => {
                        this.props.updateHoveredArtist(null)
                    }}
                >
                    <ArtistProfile artist={artist} fontDecrement={3} showPlayer={false} size={"Medium"} align={'left'}/>
                    {line}
                    {artistExpand}
                </li>
            )
        });


        return (
            <div className={"hopListSection"}>
                <ol className={"hopList"}>
                    {artists}
                </ol>
            </div>
        )
    }

}