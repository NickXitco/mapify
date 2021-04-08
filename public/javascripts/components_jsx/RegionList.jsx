class RegionList extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        const topGenre = this.props.fence.genres[0];

        const genres = this.props.fence.genres.map((g, i) => {
            return <GenreBubble key={i}
                                genre={g}
                                top={topGenre}
                                loadGenreFromSearch={this.props.loadGenreFromSearch}
                                setActiveGenreAppearance={this.props.setActiveGenreAppearance}
                                clearActiveGenreAppearance={this.props.clearActiveGenreAppearance}
            />
        })


        return(
            <div className={"relatedArtistsSection"} style={{height: "200%"}}>
                <h2>Genre Breakdown</h2>
                <div className={"bubbleList"}>
                    {genres}
                </div>
            </div>
        );
    }

}