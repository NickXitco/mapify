class ArtistProfile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fontSize: 60,
            artist: null,
            fontSizeUpdating: false
        }

        //PlayerKey makes the Spotify player unmount and remount on rerender so we don't create new history logging
        //https://stackoverflow.com/questions/52260258/reactjs-destroy-old-component-instance-and-create-new
        this.playerKey = 0;

    }

    componentDidMount() {
        if (this.props.artist !== this.state.artist) {
            this.setState({fontSize: 50, artist: this.props.artist}, () => {
                this.decrementFontSize(this.props.size);
            })
        }
    }

    componentDidUpdate() {
        if (this.props.artist !== this.state.artist) {
            this.playerKey++;
            this.setState({fontSize: 50, artist: this.props.artist}, () => {
                this.decrementFontSize(this.props.size);
            })
        }

        if (this.state.fontSizeUpdating) {
            this.decrementFontSize(this.props.size);
        }
    }

    decrementFontSize(size) {
        const heightLimit = size === "Large" ? 113 : size === "Medium" ? 60 : 40;
        const widthLimit = size === "Large" ? 300 : size === "Medium" ? 300 : 300;
        const height = this.nameElement.clientHeight;
        const width = this.nameElement.clientWidth;

        if (height > heightLimit || width > widthLimit) {
            this.setState((prevState, props) => ({
                fontSize: prevState.fontSize - props.fontDecrement
            }));
            this.setState({fontSizeUpdating: true});
        } else {
            this.setState({fontSizeUpdating: false});
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

        if (this.props.artist.tracks.length > 0 && this.props.showPlayer) {
            player = (
                <AdaptablePlayer tracks={this.props.artist.tracks} key={this.playerKey} artist={this.props.artist}/>
            )
        }

        let contents;

        if (this.props.size === "Large") {
            contents = (
                <div style={{position: 'static'}}>
                    <div className={"nameAndPictureLarge"}>
                        <div className={"sidebarPictureLarge"} style={pictureStyle}>
                            {picture}
                        </div>
                        <div className={"nameLarge"}>
                            <h1 className={"sidebarArtistNameLarge"} style={nameStyle}
                                ref={(nameElement) => {this.nameElement = nameElement}}>
                                {this.props.artist.name}
                            </h1>
                        </div>
                    </div>

                    <FollowersStats number={this.props.artist.followers} text={"Follower"} size={"Large"}/>
                    {player}
                </div>
            );
        } else if (this.props.size === "Medium") {
            contents = (
                <div style={{position: 'static'}}>
                    <div className={"nameAndPictureMedium"}>
                        <div className={"sidebarPictureMedium"} style={pictureStyle}>
                            {picture}
                        </div>
                        <div className={"nameMedium"}>
                            <h1 className={"sidebarArtistNameMedium"} style={nameStyle}
                                ref={(nameElement) => {this.nameElement = nameElement}}>
                                {this.props.artist.name}
                            </h1>
                            <FollowersStats number={this.props.artist.followers} text={"Follower"} size={"Small"}/>
                        </div>
                    </div>
                    {player}
                </div>
            );
        } else if (this.props.align === "right") {
            contents = (
                <div style={{position: 'static'}}>
                    <div className={"nameAndPictureSmallRight"}>
                        <div className={"nameSmallRight"}>
                            <h1 className={"sidebarArtistNameSmall"} style={nameStyle}
                                ref={(nameElement) => {
                                    this.nameElement = nameElement
                                }}>
                                {this.props.artist.name}
                            </h1>
                            <FollowersStats number={this.props.artist.followers} text={"Follower"} size={"Small"}/>
                        </div>
                        <div className={"sidebarPictureSmall"} style={pictureStyle}>
                            {picture}
                        </div>
                    </div>
                    {player}
                </div>
            )
        } else {
            contents = (
                <div style={{position: 'static'}}>
                    <div className={"nameAndPictureSmall"}>
                        <div className={"sidebarPictureSmall"} style={pictureStyle}>
                            {picture}
                        </div>
                        <div className={"nameSmall"}>
                            <h1 className={"sidebarArtistNameSmall"} style={nameStyle}
                                ref={(nameElement) => {
                                    this.nameElement = nameElement
                                }}>
                                {this.props.artist.name}
                            </h1>
                            <FollowersStats number={this.props.artist.followers} text={"Follower"} size={"Small"}/>
                        </div>
                    </div>
                    {player}
                </div>
            )
        }

        return (
            <div
                style={{position: 'static'}}
            >
                {contents}
            </div>
        );
    }
}