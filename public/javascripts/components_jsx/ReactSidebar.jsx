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
                    <style>
                        {`::-webkit-scrollbar-track {box-shadow: 0 0 5px ${this.props.artist.colorToString()};}  \n` +
                         `::-webkit-scrollbar-thumb {background: ${this.props.artist.colorToString()};`}
                    </style>
                    <SidebarStroke color={this.props.artist.colorToString()}/>
                    <ArtistProfile artist={this.props.artist} fontDecrement={3}/>
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