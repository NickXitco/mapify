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

        if (this.props.fence.genres.length === 0) {
            return null;
        }

        return(
            <div className={"relatedArtistsSection"} style={{maxHeight: "50%", minHeight: "242px"}}>
                <h2 className={"bubbleListHeader"}>Genre Breakdown</h2>
                <div className={"bubbleList"}>
                    {genres}
                </div>
            </div>
        );
    }

}