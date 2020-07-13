class ReactSidebar extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        if (this.props.type === "artist") {
            if (!this.props.artist) {
                return null;
            }


            return (
                <div className={"sidebar"}>
                    <SidebarStroke color={this.props.artist.colorToString()}/>
                    <div className={"nameAndPicture"}>
                        <div className={"sidebarPicture"}/>
                        <div className={"name"}>
                            <h1 className={"sidebarArtistName"}/>
                        </div>
                    </div>

                    <div className={"followersSection"}>
                        <p className={"followerCount"}/>
                        <p className={"followers"}/>
                        <p className={"followerRanking"}/>
                    </div>

                    <div className={"genresSection"}>
                        <h2>Genres</h2>
                        <ul className={"genresList"}/>
                    </div>

                    <div className={"relatedArtistsSection"}>
                        <h2>Related Artists</h2>
                        <ul className={"relatedArtistsList"}/>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}