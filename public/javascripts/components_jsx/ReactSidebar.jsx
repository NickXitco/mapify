class ReactSidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            artist: null,
            genre: null
        }

        this.updateSidebarContent = this.updateSidebarContent.bind(this);
        this.scrollbar = this.scrollbar.bind(this);
        this.undoRedo = this.undoRedo.bind(this);
    }

    updateSidebarContent(artist, genre) {
        if (this.state.artist !== artist || this.state.genre !== genre) {
            this.setState({artist: artist, genre: genre});
        }
    }

    shouldComponentUpdate(nextProps) {
        return (
            this.props.artist !== nextProps.artist ||
            this.props.genre !== nextProps.genre ||
            this.props.path !== nextProps.path ||
            this.props.fence !== nextProps.fence ||
            this.props.uiHover !== nextProps.uiHover
        );
    }

    scrollbar(colorant) {
        return (
            <style>
                {`::-webkit-scrollbar-track {box-shadow: 0 0 5px ${colorant};}  \n` +
                `::-webkit-scrollbar-thumb {background: ${colorant};`}
            </style>
        )
    }

    undoRedo(colorant) {
        return (
            <UndoRedoComponent
                color={[colorant.r, colorant.g, colorant.b]}
                sidebarState={this.props.sidebarState}
                undoSidebarState={this.props.undoSidebarState}
                redoSidebarState={this.props.redoSidebarState}
            />
        )
    }

    shadowBox(width, height, direction, bottom) {
        let mod = direction === "UP" ? "-" : "";

        return (
            <div style={{
                position: 'absolute',
                width: `${width}px`,
                height: `${height}px`,
                boxShadow: `0 ${mod}20px 10px -10px black`,
                bottom: bottom,
                pointerEvents: 'none',
                zIndex: 4,
            }}
            />
        )
    }

    render() {
        console.log(this.props.uiHover);
        const hoverStyle = {
            userSelect: this.props.uiHover ? "auto" : "none"
        }

        if (this.props.fence) {

            const topArtist = this.props.fence.top100[0];
            const topGenre = this.props.fence.genres[0];

            const topGenreColor = topGenre ? `rgb(${topGenre.r}, ${topGenre.g}, ${topGenre.b})` : 'white';

            return (
                <div className="sidebar sidebar-open"
                     style={hoverStyle}
                     onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                     onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                >

                    {this.scrollbar(topGenreColor)}

                    <SidebarStroke color={topGenreColor}/>


                    <RegionProfile fence={this.props.fence} fontDecrement={3}/>
                    <FollowersStats number={this.props.fence.numArtists} text={"Artist"} size={"Large"}/>
                    <FollowersStats number={this.props.fence.numGenres} text={"Genre"} size={"Large"}/>

                    <RegionList fence={this.props.fence}
                                loadGenreFromSearch={this.props.loadGenreFromSearch}
                                setActiveGenreAppearance={this.props.setActiveGenreAppearance}
                                clearActiveGenreAppearance={this.props.clearActiveGenreAppearance}
                    />

                    <ArtistsList artists={this.props.fence.top100}
                                 loadArtistFromUI={this.props.loadArtistFromUI}
                                 updateHoveredArtist={this.props.updateHoveredArtist}
                                 header={"Top 100 Artists"}
                                 color={topGenreColor}
                    />




                </div>
                );
        }

        if (this.props.path.length > 0) {
            const start = this.props.path[0];
            const end = this.props.path[this.props.path.length - 1];

            return (
                <div className="sidebar sidebar-open"
                     style={hoverStyle}
                     onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                     onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                >

                    {this.scrollbar(start.colorToString())}

                    <SidebarStroke color={start.colorToString()}/>

                    <ArtistProfile artist={start} fontDecrement={3} showPlayer={false} size={"Small"} align={'left'}/>
                    <ArtistProfile artist={end} fontDecrement={3} showPlayer={false} size={"Small"}  align={'right'}/>

                    {this.shadowBox(440, 200, "DOWN", "auto")}

                    <HopsList path={this.props.path}
                              loadArtistFromUI={this.props.loadArtistFromUI}
                              updateHoveredArtist={this.props.updateHoveredArtist}
                              header={`Shortest Path`}/>

                    <div className="flexSpacer"/>

                    {this.shadowBox(440, 90, "UP", 0)}
                    {this.undoRedo(start)}
                </div>
            )
        }

        if (!this.props.artist && !this.props.genre) {
            if (this.state.artist) {
                setTimeout(() => this.setState({artist: null}), 600);

                return (<div className="sidebar sidebar-closed"
                             style={hoverStyle}
                             onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                             onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                        >

                            {this.scrollbar(this.state.artist.colorToString())}

                            <SidebarStroke color={this.state.artist.colorToString()}/>

                            <ArtistProfile artist={this.state.artist} fontDecrement={3} showPlayer={true} size={"Large"} align={'left'}/>


                            <GenresList genres={this.state.artist.genres}
                                        loadGenreFromSearch={this.props.loadGenreFromSearch}
                                        header={"Genres"}
                            />

                            <ArtistsList artists={this.state.artist.relatedVertices}
                                         loadArtistFromUI={this.props.loadArtistFromUI}
                                         updateHoveredArtist={this.props.updateHoveredArtist}
                                         header={"Related Artists"}
                                         color={this.state.artist.colorToString()}
                            />

                            <div className="flexSpacer"/>
                            {this.undoRedo(this.state.artist)}
                        </div>
                );
            }
            if (this.state.genre) {
                return (
                    <div className="sidebar sidebar-closed"
                         style={hoverStyle}
                         onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                         onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                    >

                        {this.scrollbar(this.state.genre.colorToString())}

                        <SidebarStroke color={this.state.genre.colorToString()}/>

                        <GenreProfile genre={this.state.genre} fontDecrement={3}/>

                        <ArtistsList artists={this.state.genre.nodes}
                                     loadArtistFromUI={this.props.loadArtistFromUI}
                                     updateHoveredArtist={this.props.updateHoveredArtist}
                                     header={"Artists in Genre"}
                                     color={this.state.genre.colorToString()}
                        />

                        <div className="flexSpacer"/>
                        {this.undoRedo(this.state.genre)}
                    </div>
                );
            }
            return (<div className="sidebar sidebar-closed"
                         style={hoverStyle}
                         onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                         onMouseLeave={() => {this.props.updateHoverFlag(false)}}
            >
                {this.scrollbar("white")}
                <SidebarStroke color={'white'}/>
            </div>);
        }

        this.updateSidebarContent(this.props.artist, this.props.genre);

        if (this.props.artist) {
            return (
                <div className="sidebar sidebar-open"
                     style={hoverStyle}
                     onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                     onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                >
                    {this.scrollbar(this.props.artist.colorToString())}

                    <SidebarStroke color={this.props.artist.colorToString()}/>

                    <ArtistProfile artist={this.props.artist} fontDecrement={3} showPlayer={true} size={"Large"} align={'left'}/>

                    <GenresList genres={this.props.artist.genres}
                                loadGenreFromSearch={this.props.loadGenreFromSearch}
                                header={"Genres"}
                    />

                    <ArtistsList artists={this.props.artist.relatedVertices}
                                 loadArtistFromUI={this.props.loadArtistFromUI}
                                 updateHoveredArtist={this.props.updateHoveredArtist}
                                 header={"Related Artists"}
                                 color={this.props.artist.colorToString()}
                    />

                    <div className="flexSpacer"/>

                    {this.undoRedo(this.props.artist)}
                </div>
            );
        }

        if (this.props.genre) {
            return (
                <div className="sidebar sidebar-open"
                     style={hoverStyle}
                     onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                     onMouseLeave={() => {this.props.updateHoverFlag(false)}}
                >
                    {this.scrollbar(this.props.genre.colorToString())}

                    <SidebarStroke color={this.props.genre.colorToString()}/>

                    <GenreProfile genre={this.props.genre} fontDecrement={3}/>

                    <ArtistsList artists={this.props.genre.nodes}
                                 loadArtistFromUI={this.props.loadArtistFromUI}
                                 updateHoveredArtist={this.props.updateHoveredArtist}
                                 header={"Artists in Genre"}
                                 color={this.props.genre.colorToString()}
                    />

                    <div className="flexSpacer"/>

                    {this.undoRedo(this.props.genre)}
                </div>
            );
        }
    }
}