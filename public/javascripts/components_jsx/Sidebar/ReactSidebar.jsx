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

    about(closed, hoverStyle) {
        let className = closed ? "sidebar sidebar-closed" : "sidebar sidebar-open";

        const aboutContent = (
            <div style={{position: 'relative'}}>
                <p style={{marginTop: '10px'}}>
                    {
                        'Welcome to the Artist Observatory! This site was built to be a fully interactive atlas' +
                        ' of just about every artist on Spotify. Please feel free to explore and discover how the' +
                        ' massive web of over 1.3 million artists is connected!'
                    }
                </p>
                <p style={{marginTop: '10px'}}>
                    {
                        'Development started in Winter 2018 and it grew' +
                        ' into my Johns Hopkins University Master\'s thesis some time at the start of the' +
                        ' COVID-19 pandemic. If you\'re interested, you can feel free to read that thesis paper' +
                        ' here to learn more about the process by which this map is created! Though, as I continue to' +
                        ' work on this site day after day, some of the information can become quickly outdated.'
                    }
                </p>
                <p style={{marginTop: '10px'}}>
                    {
                        'As a few acknowledgements, I\'d like to thank all my friends who supported me with this' +
                        ' project all the way from its inception to the countless late-nights coding to' +
                        ' the the tedious bug testing at the very end. Specifically Sebastian Durfee, Charlotte Wood' +
                        ', Matthew Polson, Emily Daly, Lucas Polack, Sydney Thomas, Jeffrey Carrano, Matthew Flynn' +
                        ', Sophia Lipkin, and everyone else who helped along the way.'
                    }
                </p>
                <p style={{marginTop: '10px'}}>
                    {
                        'I\d also like to thank my advisor and professor Misha Kazhdan for teaching me how to write' +
                        ' 90% of all the graphics and geometry processing algorithms in this app. I\'d also like to' +
                        ' thank Daniel Shiffman for being a constant inspiration to make coding beautiful. And lastly' +
                        ' thanks everyone at Spotify for creating such a amazing platform to share music with the' +
                        ' world and for me to obsess over.'
                    }
                </p>
            </div>
        )

        const faqContent = (
            <div style={{position: 'relative'}}>
                <h3 style={{marginTop: '10px', position: 'relative', fontWeight: 800}}>
                    {'The site is running very slowly/crashing on me!'}
                </h3>
                <p style={{marginTop: '10px'}}>
                    {'Oh no! I\'m sorry to hear that. < insert info about bug submission lmao >'}
                </p>
            </div>
        )

        const changelogContent = (
            <div style={{position: 'relative'}}>
                <h3 style={{marginTop: '10px', position: 'relative', fontWeight: 800}}>
                    {'0.9.0'}
                    <span style={{fontWeight: 400, paddingLeft: '10px'}}>
                        {'The Home Stretch'}
                    </span>
                </h3>
                <ul style={{position: 'relative', margin: '10px 20px'}}>
                    <li>{'Test Item 1'}</li>
                    <li>{'Test Item 2'}</li>
                </ul>
            </div>
        )

        const controlsContent = (
            <div style={{position: 'relative'}}>
                <p style={{marginTop: '10px'}}>
                    {'Ctrl-Click on the map to draw region points'}
                </p>
                <p style={{marginTop: '10px'}}>
                    {'Ctrl-Click Drag to draw a continuous region'}
                </p>
                <p style={{marginTop: '10px'}}>
                    {'Esc to reset the camera'}
                </p>
            </div>
        )

        return (
            <div className={className}
                 style={hoverStyle}
                 onMouseEnter={this.setHoverFlag}
                 onMouseLeave={this.unsetHoverFlag}
                 onTransitionEnd={this.transitionEnd}
            >

                {this.scrollbar('white')}

                <SidebarStroke color={'white'}/>

                <div className={'aboutSidebar'}>
                    <div className={'aboutBanner'}>
                        <h2>the artist</h2>
                        <h1 style={{fontSize: "44px", lineHeight: "30px"}}>observatory</h1>
                        <p className={'credits'}>Created by <a href={'https://nickxit.co'}>Nick Xitco</a></p>
                    </div>

                    <AboutSection title={'about'} content={aboutContent}/>
                    <AboutSection title={'faq'} content={faqContent}/>
                    <AboutSection title={'changelog'} content={changelogContent}/>
                    <AboutSection title={'controls'} content={controlsContent}/>
                </div>
            </div>
        );
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

        if (this.props.historyState.page === PageStates.HOME && !this.props.loading) {
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

        if (!data && page !== PageStates.ABOUT) {
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

        if (page === PageStates.ABOUT) {
            return this.about(closed, hoverStyle);
        }

        return this.default(hoverStyle);
    }
}