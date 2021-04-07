class GenreBubble extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hover: false
        }

        this.setHover = this.setHover.bind(this);
        this.unsetHover = this.unsetHover.bind(this);
        this.clickBubble = this.clickBubble.bind(this);
    }

    setHover() {
        this.setState({hover: true});
    }

    unsetHover() {
        this.setState({hover: false});
    }

    clickBubble() {
        this.props.loadGenreFromSearch(this.props.genre.name);
    }

    render() {
        const MODIFIER = this.props.top.followers / 180;
        const g = this.props.genre;
        const color =`rgb(${g.r}, ${g.g}, ${g.b})`;

        const size = Math.max(this.props.genre.followers / MODIFIER, 5);

        const sizing = {
            width: size,
            height: size,
            background: `linear-gradient(45deg, rgba(${g.r}, ${g.g}, ${g.b}, 1) 0%, rgba(${g.r * (2/3)}, ${g.g * (2/3)}, ${g.b * (2/3)}, 0.8) 100%)`,
            boxShadow: `${color} 0 0 7.5px 0`
        }

        let text = this.state.hover ? (<p className={"bubbleText"}>{g.name}</p>) : null

        return (
            <div style={sizing} className={"bubble"}
                 onMouseEnter={this.setHover}
                 onMouseLeave={this.unsetHover}
                 onClick={this.clickBubble}
            >
                {text}
            </div>
        )
    }

}