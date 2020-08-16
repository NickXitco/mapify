class ArtistProfile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fontSize: 60,
            artist: null,
            fontSizeUpdating: false
        }

    }

    componentDidMount() {
        if (this.props.artist !== this.state.artist) {
            this.setState({fontSize: 60, artist: this.props.artist}, () => {
                this.decrementFontSize();
            })
        }
    }

    componentDidUpdate() {
        if (this.props.artist !== this.state.artist) {
            this.setState({fontSize: 60, artist: this.props.artist}, () => {
                this.decrementFontSize();
            })
        }

        if (this.fontSizeUpdating) {
            this.decrementFontSize();
        }
    }

    decrementFontSize() {
        const height = this.nameElement.clientHeight;
        const width = this.nameElement.clientWidth;

        if (height > 113 || width > 265) {
            this.setState((prevState, props) => ({
                fontSize: prevState.fontSize - props.fontDecrement
            }));
            this.fontSizeUpdating = true;
        } else {
            this.fontSizeUpdating = false;
        }
    }

    render() {
        const pictureStyle = {
            boxShadow: `0 0 13px 1px ${this.props.artist.colorToString()}, inset 0 0 1px 2px ${this.props.artist.colorToString()}`
        }

        const nameStyle = {
            fontSize: this.state.fontSize
        }

        //TODO default picture
        let picture = null;

        if (this.props.artist.images.length > 0) {
            picture = (<img src={this.props.artist.images[0].url} alt={this.props.artist.name}/>);
        }

        let player = null

        if (this.props.artist.track) {
            player = (
                <Player uri={`spotify:track:${this.props.artist.track.id}`}/>
            )
        }

        return (
            <div style={{position: 'static'}}>
                <div className={"nameAndPicture"}>
                    <div className={"sidebarPicture"} style={pictureStyle}>
                        {picture}
                    </div>
                    <div className={"name"}>
                        <h1 className={"sidebarArtistName"} style={nameStyle}
                            ref={(nameElement) => {this.nameElement = nameElement}}>
                            {this.props.artist.name}
                        </h1>
                    </div>
                </div>

                <FollowersStats artist={this.props.artist}/>
                {player}
            </div>
        );
    }
}