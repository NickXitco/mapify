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
        let player = null;

        if (!this.props.artist && !this.props.genre) {
            if (this.state.artist) {
                setTimeout(() => this.setState({artist: null}), 600);

                if (this.state.artist.track) {
                    player = (
                        <Player uri={`spotify:track:${this.state.artist.track.id}`}/>
                    )
                }

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

                            {player}
                            <p style={{padding: "10px 22px", fontSize: "12px"}}>Headphone warning, this can be pretty loud</p>


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
            }
            if (this.state.genre) {
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
            return (<div className="sidebar sidebar-closed"
                         onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                         onMouseLeave={() => {this.props.updateHoverFlag(false)}}
            >

                <style>
                    {`::-webkit-scrollbar-track {box-shadow: 0 0 5px white;}  \n` +
                    `::-webkit-scrollbar-thumb {background: white};`}
                </style>

                <SidebarStroke color={'white'}/>
            </div>);
        }

        this.updateSidebarContent(this.props.artist, this.props.genre);

        if (this.props.artist) {
            if (this.props.artist.track) {
                player = (
                    <Player uri={`spotify:track:${this.props.artist.track.id}`}/>
                )
            }

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

                    {player}
                    <p style={{padding: "10px 22px", fontSize: "12px"}}>Headphone warning, this can be pretty loud</p>

                    <GenresList genres={this.props.artist.genres}
                                loadGenreFromSearch={this.props.loadGenreFromSearch}
                                header={"Genres"}
                    />

                    <ArtistsList artists={this.props.artist.relatedVertices}
                                 loadArtistFromUI={this.props.loadArtistFromUI}
                                 updateHoveredArtist={this.props.updateHoveredArtist}
                                 header={"Related Artists"}
                    />

                    <UndoRedoComponent
                        color={[this.props.artist.r, this.props.artist.g, this.props.artist.b]}
                        sidebarState={this.props.sidebarState}
                        undoSidebarState={this.props.undoSidebarState}
                        redoSidebarState={this.props.redoSidebarState}
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