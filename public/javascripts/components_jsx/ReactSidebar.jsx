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
                    <ArtistProfile artist={this.props.artist}/>
                    <FollowersStats artist={this.props.artist}/>
                    <GenresList genres={this.props.artist.genres}/>
                    <ArtistsList artists={this.props.artist.relatedVertices}/>
                </div>
            );
        } else {
            return null;
        }
    }
}