class GenreBubble extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hover: false,
            leftSide: true,
            offset: 0,
            offsetHeight: 0,
        }

        this.textBoxRef = React.createRef();
        this.bubbleRef = React.createRef();

        this.setHover = this.setHover.bind(this);
        this.unsetHover = this.unsetHover.bind(this);
        this.clickBubble = this.clickBubble.bind(this);
    }

    setHover() {
        this.setState({hover: true});
        this.props.setActiveGenreAppearance(this.props.genre.name);
    }

    unsetHover() {
        this.setState({hover: false});
        this.props.clearActiveGenreAppearance();
    }

    clickBubble() {
        this.props.loadGenreFromSearch(this.props.genre.name, null);
    }

    componentDidMount() {
        if (this.bubbleRef.current && this.bubbleRef.current.offsetLeft > 200) {
            this.setState({
                leftSide: false,
                offset: -this.textBoxRef.current.clientWidth,
            });
        }

        if (this.textBoxRef.current) {
            this.setState({
                offsetHeight: this.textBoxRef.current.offsetHeight,
            });
        }
    }

    render() {
        const MODIFIER = this.props.top.followers / 175;
        const g = this.props.genre;
        const color =`rgb(${g.r}, ${g.g}, ${g.b})`;

        const size = Math.max(this.props.genre.followers / MODIFIER, 5);

        const sizing = {
            width: size,
            height: size,
            background: `linear-gradient(45deg, rgb(${g.r}, ${g.g}, ${g.b}) 0%, 
            rgba(${g.r * (2/3)}, ${g.g * (2/3)}, ${g.b * (2/3)}, 0.5) 100%)`,
            boxShadow: `${color} 0 0 10px 0, inset ${color} 0 0 5px 0`
        }

        if (g.r === 0 && g.g === 0 && g.b === 0) {
            sizing.background = `linear-gradient(45deg, rgba(255, 255, 255, 0.25) 0%, 
            rgba(127, 127, 127, 0) 75%)`;
            sizing.boxShadow = `white 0 0 10px 0, inset white 0 0 5px 0`
        }

        const textBoxStyling = {
            left: this.state.leftSide ? `${size / 2}px` : `${this.state.offset + size / 2}px`,
            bottom: `${this.state.offsetHeight / 2}px`,
            textAlign: this.state.leftSide ? 'left' : 'right',
            borderRadius: this.state.leftSide ? '20px 10px 20px 0' : '10px 20px 0 20px',
            visibility: this.state.hover ? 'visible' : 'hidden',
        }

        let genreName = null;

        const thumbnailStyling = {
            width: `${size * 0.75}px`,
            fontSize: `${size * 0.1}px`
        }

        const thumbnailDivStyling = {
            width: `${size}px`
        }

        if (size > 5) {
            genreName = (
                <div className={"smallGenreBubbleName"} style={thumbnailDivStyling}>
                    <p className={"genreBubbleThumbnailText"} style={thumbnailStyling}>{g.name}</p>
                </div>
            );
        }

        return (
            <div style={sizing} className={"bubble"}
                 onMouseEnter={this.setHover}
                 onMouseLeave={this.unsetHover}
                 onClick={this.clickBubble}
                 ref={this.bubbleRef}
            >
                {genreName}
                <div className={"bubbleTextBox"} style={textBoxStyling} ref={this.textBoxRef}>
                    <p className={"bubbleText bubbleGenreName"}>{g.name}</p>
                    <p className={"bubbleText bubbleNumber"}>{g.counts}<span className={"bubbleNumName"}>artists</span></p>
                    <p className={"bubbleText bubbleNumber"}>{Utils.formatNum(g.followers)}<span className={"bubbleNumName"}>followers</span></p>
                </div>

            </div>
        )
    }

}