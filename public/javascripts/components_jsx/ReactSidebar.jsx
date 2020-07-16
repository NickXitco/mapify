class ReactSidebar extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        /*
        openSidebar: function () {
            const twentyFive = window.innerWidth.width / 4;
            Sidebar.dom.style.left = Utils.map(Eases.easeOutQuart(Sidebar.openAmount), 0, 1, twentyFive, 0) + "px";
            Sidebar.openAmount = Math.min(1, Sidebar.openAmount + 0.05);
        }
         */
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
                                 loadArtistFromUI={this.props.loadArtistFromUI}
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

                    <style>
                        {`::-webkit-scrollbar-track {box-shadow: 0 0 5px ${this.props.genre.colorToString()};}  \n` +
                        `::-webkit-scrollbar-thumb {background: ${this.props.genre.colorToString()};`}
                    </style>

                    <SidebarStroke color={this.props.genre.colorToString()}/>

                    <ArtistProfile artist={this.props.genre} fontDecrement={3}/>

                    <ArtistsList artists={this.props.genre.nodes}
                                 loadArtistFromUI={this.props.loadArtistFromUI}
                                 header={"Artists in Genre"}
                    />

                </div>
            );
        }
    }
}