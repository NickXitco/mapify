class HopsList extends React.Component {
    constructor(props) {
        super(props);
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
                            position: 'static',
                            background: `linear-gradient(180deg, ${artist.colorToString()}, ${this.props.path[index + 1].colorToString()})`,
                            height: '100px',
                            width: '2px',
                            marginLeft: '62px',
                            marginTop: '-23px',
                            marginBottom: '-33px',
                        }}
                    />
                )
            }

            return (
                <li className={"hopListItem"}
                    key={artist.id.toString()}
                    onClick={() => {
                        this.props.loadArtistFromUI(artist)
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