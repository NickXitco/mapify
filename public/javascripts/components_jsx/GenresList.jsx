class GenresList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.genres.length === 0) {
            return null;
        }

        const SIDEBAR_GENRE_LIMIT = 10
        const genres = this.props.genres.slice(0, SIDEBAR_GENRE_LIMIT).map(genre =>
            <li className={"sidebarListItem"}
                key={genre.toString()}
                onClick={() => {this.props.loadGenreFromSearch(genre.toString(), null)}}
            >
                {genre.toString()}
            </li>
        );


        return (
            <div className={"genresSection"}>
                <h2>{this.props.header}</h2>
                <ul className={"genresList"}>
                    {genres}
                </ul>
            </div>
        )
    }
}