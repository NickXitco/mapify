class GenresList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.genres.length === 0) {
            return null;
        }

        const genres = this.props.genres.map(genre =>
            <li className={"sidebarListItem"} key={genre.toString()}>{genre.toString()}</li>
        );

        return (
            <div className={"genresSection"}>
                <h2>Genres</h2>
                <ul className={"genresList"}>
                    {genres}
                </ul>
            </div>
        )
    }
}