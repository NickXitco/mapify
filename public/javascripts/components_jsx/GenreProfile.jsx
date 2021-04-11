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

    shapeBoundingBox(points) {
        let n = -Infinity;
        let e = -Infinity;
        let s = Infinity;
        let w = Infinity;

        for (const p of points) {
            n = Math.max(p.y, n);
            e = Math.max(p.x, e);
            s = Math.min(p.y, s);
            w = Math.min(p.x, w);
        }

        const height = Math.abs(n - s);
        const width = Math.abs(e - w);

        if (height > width) {
            e += (height - width) / 2;
            w -= (height - width) / 2;
        } else if (width > height) {
            n += (width - height) / 2;
            s -= (width - height) / 2;
        }

        return {
            n: n,
            e: e,
            s: s,
            w: w
        }
    }

    render() {

        const nameStyle = {
            fontSize: this.state.fontSize
        }

        const bBox = this.shapeBoundingBox(this.props.genre.hull)

        let polygonString = "";
        for (const p of this.props.genre.hull) {
            polygonString += `${Utils.map(p.x + 23, bBox.w, bBox.e, 10, 103) + 23} `
            polygonString += `${Utils.map(p.y + 23, bBox.s, bBox.n, 103, 10) + 23} `
        }

        return (
            <div className={"nameAndPictureLarge"}>
                <div className={"genrePictureLarge"}>
                    <svg width="159" height="159">
                        <defs>
                            <filter id="sofGlow" height="2000%" width="2000%" x="-500%" y="-500%">
                                <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="thicken" />
                                <feGaussianBlur in="thicken" stdDeviation="10" result="blurred" />
                                <feFlood floodColor={this.props.genre.colorToString()} result="glowColor" />
                                <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
                                <feMerge>
                                    <feMergeNode in="softGlow_colored"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        <polygon points={polygonString} stroke={this.props.genre.colorToString()} fill="transparent" filter="url(#sofGlow)" strokeWidth="2"/>
                    </svg>
                </div>
                <div className={"nameLarge"}>
                    <h1 className={"sidebarArtistNameLarge"} style={nameStyle}
                        ref={(nameElement) => {this.nameElement = nameElement}}>
                        {this.props.genre.name}
                    </h1>
                </div>
            </div>
        );
    }
}