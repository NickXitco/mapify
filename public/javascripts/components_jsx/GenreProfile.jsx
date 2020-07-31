class GenreProfile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fontSize: 60,
            genre: null,
            fontSizeUpdating: false
        }

    }

    componentDidMount() {
        if (this.props.genre !== this.state.genre) {
            this.setState({fontSize: 60, genre: this.props.genre}, () => {
                this.decrementFontSize();
            })
        }
    }

    componentDidUpdate() {
        if (this.props.genre !== this.state.genre) {
            this.setState({fontSize: 60, genre: this.props.genre}, () => {
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
            boxShadow: `0 0 13px 1px ${this.props.genre.colorToString()}, inset 0 0 1px 2px ${this.props.genre.colorToString()}`
        }

        const nameStyle = {
            fontSize: this.state.fontSize
        }

        let picture = null;

        return (
            <div className={"nameAndPicture"}>
                <div className={"sidebarPicture"} style={pictureStyle}>
                    {picture}
                </div>
                <div className={"name"}>
                    <h1 className={"sidebarArtistName"} style={nameStyle}
                        ref={(nameElement) => {this.nameElement = nameElement}}>
                        {this.props.genre.name}
                    </h1>
                </div>
            </div>
        );
    }
}