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

        this.path = this.path.bind(this);
        this.artist = this.artist.bind(this);
        this.genre = this.genre.bind(this);
        this.region = this.region.bind(this);
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

    path(closed, hoverStyle, data) {
        const start = data[0];
        const end = data[data.length - 1];

        let className = closed ? "sidebar sidebar-closed" : "sidebar sidebar-open"

        return (
            <div className={className}
                 style={hoverStyle}
                 onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                 onMouseLeave={() => {this.props.updateHoverFlag(false)}}
            >

                {this.scrollbar(start.colorToString())}

                <SidebarStroke color={start.colorToString()}/>

                <ArtistProfile artist={start} fontDecrement={3} showPlayer={false} size={"Small"} align={'left'}/>
                <ArtistProfile artist={end} fontDecrement={3} showPlayer={false} size={"Small"}  align={'right'}/>

                {this.shadowBox(440, 200, "DOWN", "auto")}

                <HopsList path={data}
                          loadArtistFromUI={this.props.loadArtistFromUI}
                          updateHoveredArtist={this.props.updateHoveredArtist}
                          header={`Shortest Path`}/>

                <div className="flexSpacer"/>

                {this.shadowBox(440, 90, "UP", 0)}
                {this.undoRedo(start)}
            </div>
        );
    }

    artist(closed, hoverStyle, data) {
        let className = closed ? "sidebar sidebar-closed" : "sidebar sidebar-open"

        return (
            <div className={className}
                 style={hoverStyle}
                 onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                 onMouseLeave={() => {this.props.updateHoverFlag(false)}}
            >
                {this.scrollbar(data.colorToString())}

                <SidebarStroke color={data.colorToString()}/>

                <ArtistProfile artist={data} fontDecrement={3} showPlayer={true} size={"Large"} align={'left'}/>

                <GenresList genres={data.genres}
                            loadGenreFromSearch={this.props.loadGenreFromSearch}
                            header={"Genres"}
                />

                <ArtistsList artists={data.relatedVertices}
                             loadArtistFromUI={this.props.loadArtistFromUI}
                             updateHoveredArtist={this.props.updateHoveredArtist}
                             header={"Related Artists"}
                             color={data.colorToString()}
                />

                <div className="flexSpacer"/>

                {this.undoRedo(data)}
            </div>
        );
    }

    genre(closed, hoverStyle, data) {
        let className = closed ? "sidebar sidebar-closed" : "sidebar sidebar-open"

        return (
            <div className={className}
                 style={hoverStyle}
                 onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                 onMouseLeave={() => {this.props.updateHoverFlag(false)}}
            >
                {this.scrollbar(data.colorToString())}

                <SidebarStroke color={data.colorToString()}/>

                <GenreProfile genre={data} fontDecrement={3}/>

                <ArtistsList artists={data.nodes}
                             loadArtistFromUI={this.props.loadArtistFromUI}
                             updateHoveredArtist={this.props.updateHoveredArtist}
                             header={"Artists in Genre"}
                             color={data.colorToString()}
                />

                <div className="flexSpacer"/>

                {this.undoRedo(data)}
            </div>
        );
    }

    region(closed, hoverStyle, data) {
        const topArtist = data.top100[0];
        const topGenre = data.genres[0];

        const topGenreColor = topGenre ? `rgb(${topGenre.r}, ${topGenre.g}, ${topGenre.b})` : 'white';

        let className = closed ? "sidebar sidebar-closed" : "sidebar sidebar-open"

        return (
            <div className={className}
                 style={hoverStyle}
                 onMouseEnter={() => {this.props.updateHoverFlag(true)}}
                 onMouseLeave={() => {this.props.updateHoverFlag(false)}}
            >

                {this.scrollbar(topGenreColor)}

                <SidebarStroke color={topGenreColor}/>


                <RegionProfile fence={data} fontDecrement={3}/>
                <FollowersStats number={data.numArtists} text={"Artist"} size={"Large"}/>
                <FollowersStats number={data.numGenres} text={"Genre"} size={"Large"}/>

                <RegionList fence={data}
                            loadGenreFromSearch={this.props.loadGenreFromSearch}
                            setActiveGenreAppearance={this.props.setActiveGenreAppearance}
                            clearActiveGenreAppearance={this.props.clearActiveGenreAppearance}
                />

                <ArtistsList artists={data.top100}
                             loadArtistFromUI={this.props.loadArtistFromUI}
                             updateHoveredArtist={this.props.updateHoveredArtist}
                             header={"Top 100 Artists"}
                             color={topGenreColor}
                />
            </div>
        );
    }

    render() {
        const hoverStyle = {
            userSelect: this.props.uiHover ? "auto" : "none"
        }

        if (this.props.fence) {
            return this.region(false, hoverStyle, this.props.fence);
        }

        if (this.props.path.length > 0) {
            return this.path(false, hoverStyle, this.props.path);
        }

        if (!this.props.artist && !this.props.genre) {
            if (this.state.artist) {
                setTimeout(() => this.setState({artist: null}), 600);
                return this.artist(true, hoverStyle, this.state.artist);
            }
            if (this.state.genre) {
                return this.genre(true, hoverStyle, this.state.genre);
            }
        }

        this.updateSidebarContent(this.props.artist, this.props.genre);

        if (this.props.artist) {
            return this.artist(false, hoverStyle, this.props.artist);
        }

        if (this.props.genre) {
            return this.genre(false, hoverStyle, this.props.genre);
        }
    }
}