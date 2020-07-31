class ReactSidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            artist: null,
            genre: null
        }

        this.updateSidebarContent = this.updateSidebarContent.bind(this);
    }

    updateSidebarContent(artist, genre) {
        if (this.state.artist !== artist || this.state.genre !== genre) {
            this.setState({artist: artist, genre: genre});
        }
    }

    render() {
        if (!this.props.artist && !this.props.genre) {
            if (this.state.artist) {
                return (<div className="sidebar sidebar-closed"
                             onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                             onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                        >

                            <style>
                                {`::-webkit-scrollbar-track {box-shadow: 0 0 5px ${this.state.artist.colorToString()};}  \n` +
                                `::-webkit-scrollbar-thumb {background: ${this.state.artist.colorToString()};`}
                            </style>

                            <SidebarStroke color={this.state.artist.colorToString()}/>

                            <ArtistProfile artist={this.state.artist} fontDecrement={3}/>

                            <FollowersStats artist={this.state.artist}/>

                            <Player uri={"spotify:track:37iFlmC2ZbLcRtyZYPLSYA"}/>

                            <GenresList genres={this.state.artist.genres}
                                        loadGenreFromSearch={this.props.loadGenreFromSearch}
                                        header={"Genres"}
                            />

                            <ArtistsList artists={this.state.artist.relatedVertices}
                                         loadArtistFromUI={this.props.loadArtistFromUI}
                                         updateHoveredArtist={this.props.updateHoveredArtist}
                                         header={"Related Artists"}
                            />
                        </div>
                );
            } else if (this.state.genre) {
                return (
                    <div className="sidebar sidebar-closed"
                         onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                         onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                    >

                        <style>
                            {`::-webkit-scrollbar-track {box-shadow: 0 0 5px ${this.state.genre.colorToString()};}  \n` +
                            `::-webkit-scrollbar-thumb {background: ${this.state.genre.colorToString()};`}
                        </style>

                        <SidebarStroke color={this.state.genre.colorToString()}/>

                        <GenreProfile genre={this.state.genre} fontDecrement={3}/>

                        <ArtistsList artists={this.state.genre.nodes}
                                     loadArtistFromUI={this.props.loadArtistFromUI}
                                     updateHoveredArtist={this.props.updateHoveredArtist}
                                     header={"Artists in Genre"}
                        />

                    </div>
                );
            }
            return null;
        }

        this.updateSidebarContent(this.props.artist, this.props.genre);

        if (this.props.artist) {
            return (
                <div className="sidebar sidebar-open"
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

                    <Player uri={"spotify:track:37iFlmC2ZbLcRtyZYPLSYA"}/>

                    <GenresList genres={this.props.artist.genres}
                                loadGenreFromSearch={this.props.loadGenreFromSearch}
                                header={"Genres"}
                    />

                    <ArtistsList artists={this.props.artist.relatedVertices}
                                 loadArtistFromUI={this.props.loadArtistFromUI}
                                 updateHoveredArtist={this.props.updateHoveredArtist}
                                 header={"Related Artists"}
                    />
                </div>
            );
        }

        if (this.props.genre) {
            return (
                <div className="sidebar sidebar-open"
                     onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                     onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                >

                    <style>
                        {`::-webkit-scrollbar-track {box-shadow: 0 0 5px ${this.props.genre.colorToString()};}  \n` +
                        `::-webkit-scrollbar-thumb {background: ${this.props.genre.colorToString()};`}
                    </style>

                    <SidebarStroke color={this.props.genre.colorToString()}/>

                    <GenreProfile genre={this.props.genre} fontDecrement={3}/>

                    <ArtistsList artists={this.props.genre.nodes}
                                 loadArtistFromUI={this.props.loadArtistFromUI}
                                 updateHoveredArtist={this.props.updateHoveredArtist}
                                 header={"Artists in Genre"}
                    />

                </div>
            );
        }
    }
}