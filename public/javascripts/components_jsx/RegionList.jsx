class RegionList extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        const topGenre = this.props.fence.genres[0];

        const genres = this.props.fence.genres.map((g, i) => {
            return <GenreBubble key={i} genre={g} top={topGenre} loadGenreFromSearch={this.props.loadGenreFromSearch}/>
        })


        return(
            <div className={"relatedArtistsSection"}>
                <h2>Genre Breakdown</h2>
                <div className={"bubbleList"}>
                    {genres}
                </div>
            </div>
        );
    }

}