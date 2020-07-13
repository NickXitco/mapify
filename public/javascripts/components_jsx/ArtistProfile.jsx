class ArtistProfile extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const pictureStyle = {
            boxShadow: "0 0 13px 1px " + this.props.artist.colorToString()
        }

        const nameStyle = {
            fontSize: "30px"
        }

        return (
            <div className={"nameAndPicture"}>
                <div className={"sidebarPicture"} style={pictureStyle}/>
                <div className={"name"}>
                    <h1 className={"sidebarArtistName"} style={nameStyle}>
                        {this.props.artist.name}
                    </h1>
                </div>
            </div>
        );
    }
}