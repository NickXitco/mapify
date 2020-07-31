class ReactInfobox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            height: 0,
            width: 0
        }
    }


    componentDidUpdate() {
        if (!this.props.artist) {
            return;
        }

        const height = this.nameElement.clientHeight + this.genreElement.clientHeight;
        const width = Math.max(this.nameElement.clientWidth, this.genreElement.clientWidth);

        if (height !== this.state.height || width !== this.state.width) {
            this.setState({height: height, width: width});
        }
    }

    render() {
        if (!this.props.artist) {
            return null;
        }

        console.trace(this.state.height, this.state.width);

        const infoBoxDynamicStyles = {
            borderColor: this.props.artist.colorToString(),
            boxShadow: "0 0 3px 1px " + this.props.artist.colorToString(),

            top: this.props.point.y + "px",
            left: (this.props.point.x >= window.innerWidth / 2)
                ? (this.props.point.x - this.state.width - 6) + "px"
                : (this.props.point.x) + "px"
        }

        const dir = this.props.point.x >= window.innerWidth / 2 ? "Right" : "Left";

        return (
            <div className={"infoBox infoBox" + dir}  style={infoBoxDynamicStyles}>
                <p className={"infoBoxText infoBoxArtistName infoBoxArtistName" + dir}
                   ref={(nameElement) => {this.nameElement = nameElement}}>
                    {this.props.artist.name}
                </p>
                <p className={"infoBoxText infoBoxArtistGenre infoBoxArtistGenre" + dir}
                   ref={(genreElement) => {this.genreElement = genreElement}}>
                    {this.props.artist.genres.length > 0 ? this.props.artist.genres[0] : ""}
                </p>
            </div>
        )
    }
}