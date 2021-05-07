class ReactSidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false
        }

        this.scrollbar = this.scrollbar.bind(this);
        this.setHoverFlag = this.setHoverFlag.bind(this);
        this.unsetHoverFlag = this.unsetHoverFlag.bind(this);

        this.path = this.path.bind(this);
        this.artist = this.artist.bind(this);
        this.genre = this.genre.bind(this);
        this.region = this.region.bind(this);
        this.default = this.default.bind(this);
        this.transitionEnd = this.transitionEnd.bind(this);

        this.myRef = React.createRef();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props.historyState !== nextProps.historyState ||
            this.state.open !== nextState.open ||
            this.props.loading !== nextProps.loading ||
            this.props.uiHover !== nextProps.uiHover
        );
    }

    scrollbar(colorant) {
        const realColorant = Colorant.fromString(colorant);
        return (
            <style>
                {
                    `
                    ::-webkit-scrollbar-track {box-shadow: 0 0 5px ${colorant}; 
                    background: ${realColorant.colorToStringAlpha(0.2)}; 
                    border: ${colorant} solid 1px;} \n
                    ::-webkit-scrollbar-thumb {background: ${colorant};
                    `
                }
            </style>
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

    setHoverFlag() {
        this.props.updateHoverFlag(true);
    }

    unsetHoverFlag() {
        this.props.updateHoverFlag(false);
    }

    path(closed, hoverStyle, data) {
        const start = data.nodes[0];
        const end = data.nodes[data.nodes.length - 1];

        let className = closed ? "sidebar sidebar-closed" : "sidebar sidebar-open"

        return (
            <div className={className}
                 style={hoverStyle}
                 onMouseEnter={this.setHoverFlag}
                 onMouseLeave={this.unsetHoverFlag}
                 onTransitionEnd={this.transitionEnd}
            >

                {this.scrollbar(start.colorToString())}

                <SidebarStroke color={start.colorToString()}/>

                <ArtistProfile artist={start} fontDecrement={3} showPlayer={false} size={"Small"} align={'left'}/>
                <ArtistProfile artist={end} fontDecrement={3} showPlayer={false} size={"Small"}  align={'right'}/>

                {this.shadowBox(440, 200, "DOWN", "auto")}

                <HopsList path={data.nodes}
                          loadArtistFromUI={this.props.loadArtistFromUI}
                          updateHoveredArtist={this.props.updateHoveredArtist}
                          header={`Shortest Path`}
                          moveCamera={this.props.moveCamera}
                />

                <div className="flexSpacer"/>
            </div>
        );
    }

    artist(closed, hoverStyle, data) {
        let className = closed ? "sidebar sidebar-closed" : "sidebar sidebar-open"

        return (
            <div className={className}
                 style={hoverStyle}
                 onMouseEnter={this.setHoverFlag}
                 onMouseLeave={this.unsetHoverFlag}
                 onTransitionEnd={this.transitionEnd}
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
            </div>
        );
    }

    genre(closed, hoverStyle, data) {
        let className = closed ? "sidebar sidebar-closed" : "sidebar sidebar-open"

        return (
            <div className={className}
                 style={hoverStyle}
                 onMouseEnter={this.setHoverFlag}
                 onMouseLeave={this.unsetHoverFlag}
                 onTransitionEnd={this.transitionEnd}
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
            </div>
        );
    }

    region(closed, hoverStyle, data) {
        const topArtist = data.top100[0];
        const topGenre = data.genres[0];

        let genreColorant;
        if (!topGenre) {
            genreColorant = new Colorant(0, 0, 0, true);
        } else {
            genreColorant = new Colorant(topGenre.r, topGenre.g, topGenre.b, true);
        }

        const topGenreColor = topGenre ? genreColorant.colorToString() : 'white';

        let className = closed ? "sidebar sidebar-closed" : "sidebar sidebar-open"

        return (
            <div className={className}
                 style={hoverStyle}
                 onMouseEnter={this.setHoverFlag}
                 onMouseLeave={this.unsetHoverFlag}
                 onTransitionEnd={this.transitionEnd}
            >

                {this.scrollbar(topGenreColor)}

                <SidebarStroke color={topGenreColor}/>

                <RegionProfile color={topGenreColor} fence={data} fontDecrement={3}/>
                <FollowersStats number={data.numArtists} text={"Artist"} size={"Large"}/>
                <FollowersStats number={data.numGenres} text={"Genre"} size={"Large"}/>
                <div style={{position: "static", overflow: "auto", display: "flex", flexDirection: "column"}}>
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
            </div>
        );
    }

    loading(hoverStyle) {
        return (
                <div className={"sidebar sidebar-open"}
                     style={hoverStyle}
                     onMouseEnter={this.setHoverFlag}
                     onMouseLeave={this.unsetHoverFlag}
                     onTransitionEnd={this.transitionEnd}
                >
                    {this.scrollbar("white")}
                    <SidebarStroke color={"white"}/>
                    <Loading/>
                </div>
            )
    }

    default(hoverStyle) {
        return (
            <div className={"sidebar sidebar-closed"}
                 style={hoverStyle}
                 onMouseEnter={this.setHoverFlag}
                 onMouseLeave={this.unsetHoverFlag}
                 onTransitionEnd={this.transitionEnd}
            >
                {this.scrollbar("white")}
                <SidebarStroke color={"white"}/>
            </div>
        )
    }

    transitionEnd(e) {
        if (e.propertyName !== "margin-right") {
            return;
        }

        if (this.props.historyState.page === PageStates.HOME) {
            this.setState({open: false});
        } else {
            this.setState({open: true});
        }
    }

    render() {
        const hoverStyle = {
            userSelect: this.props.uiHover ? "auto" : "none"
        }

        let data = this.props.historyState.getData();
        let closed = false;
        let page = this.props.historyState.page;

        if (
            this.props.historyState.prev &&
            this.props.historyState.page === PageStates.HOME &&
            this.props.historyState.prev.page !== PageStates.HOME &&
            this.state.open
        ) {
            //We've gone from a content sidebar to the home sidebar
            //So we want to load instead the closed version of the last page, and then after a delay,
            //if we're still on the home page, switch to the home page.

            data = this.props.historyState.prev.getData();
            closed = true;
            page = this.props.historyState.prev.page;
        }

        if (this.props.loading) {
            return this.loading(hoverStyle);
        }

        if (!data) {
            return this.default();
        }

        if (page === PageStates.REGION) {
            return this.region(closed, hoverStyle, data);
        }

        if (page === PageStates.PATH) {
            return this.path(closed, hoverStyle, data);
        }

        if (page === PageStates.ARTIST) {
            return this.artist(closed, hoverStyle, data);
        }

        if (page === PageStates.REGION_ARTIST || page === PageStates.GENRE_ARTIST) {
            return this.artist(closed, hoverStyle, data.artist);
        }

        if (page === PageStates.GENRE) {
            return this.genre(closed, hoverStyle, data);
        }

        return this.default(hoverStyle);
    }
}