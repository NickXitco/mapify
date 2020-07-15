class ReactSidebar extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        if (!this.props.artist && !this.props.genre) {
            this.props.updateHoverFlag(false);
            return null;
        }

        if (this.props.artist) {
            return (
                <div className={"sidebar"}
                     onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                     onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                >

                    <style>
                        {`::-webkit-scrollbar-track {box-shadow: 0 0 5px ${this.props.artist.colorToString()};}  \n` +
                        `::-webkit-scrollbar-thumb {background: ${this.props.artist.colorToString()};`}
                    </style>

                    <SidebarStroke color={this.props.artist.colorToString()}/>

                    <ArtistProfile artist={this.props.artist} fontDecrement={3}/>

                    <FollowersStats artist={this.props.artist}/>

                    <GenresList genres={this.props.artist.genres}
                                loadGenreFromSearch={this.props.loadGenreFromSearch}
                                header={"Genres"}
                    />

                    <ArtistsList artists={this.props.artist.relatedVertices}
                                 loadArtistFromUI={this.loadArtistFromUI}
                                 header={"Related Artists"}
                    />
                </div>
            );
        }

        if (this.props.genre) {
            return (
                <div className={"sidebar"}
                     onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                     onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                >
                </div>
            );
        }
    }
}