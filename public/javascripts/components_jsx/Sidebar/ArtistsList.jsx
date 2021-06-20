const Order = {
    FOLLOWERS: 0,
    ALPHABETIC: 1,
    RANDOM: 2
}

class ArtistsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            order: Order.FOLLOWERS,
            reversed: false
        }

        this.changeOrder = this.changeOrder.bind(this);
    }

    changeOrder(state) {
        if (state === this.state.order) {
            this.setState({reversed: !this.state.reversed});
        }
        this.setState({order: state});
    }

    render() {
        if (this.props.artists.size === 0 || this.props.artists.length === 0) {
            return null;
        }

        let relatedArray = [...this.props.artists]

        if (this.state.order === Order.FOLLOWERS) {
            relatedArray = relatedArray.sort(((a, b) => {
                return b.followers - a.followers;
            }));
        } else if (this.state.order === Order.ALPHABETIC) {
            relatedArray = relatedArray.sort(((a, b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            }));
        } else if (this.state.order === Order.RANDOM) {
            relatedArray = shuffle(relatedArray);
        }

        if (this.state.reversed) {
            relatedArray = relatedArray.reverse();
        }

        const artists = relatedArray.map(artist =>
            <li className={"sidebarListItem"}
                key={artist.id.toString()}
            >
                <p
                    onClick={() => {this.props.loadArtistFromUI(artist)}}
                    onMouseEnter={() => {this.props.updateHoveredArtist(artist)}}
                    onMouseLeave={() => {this.props.updateHoveredArtist(null)}}
                >
                    {artist.name.toString()}
                </p>
            </li>
        );

        return (
            <div className={"relatedArtistsSection"} style={{flex: 1}}>
                <div className={"artistListHeader"}>
                    <h2>{this.props.header}</h2>
                    <MultiwaySwitch
                        newPosition={this.changeOrder}
                        states={[
                            SWITCH_STATES.FOLLOWERS,
                            SWITCH_STATES.ALPHABETICAL,
                            SWITCH_STATES.RANDOM
                        ]}
                        color={this.props.color}
                        reversed={this.state.reversed}
                    />
                </div>
                <ul className={"relatedArtistsList"}>
                    {artists}
                </ul>
            </div>
        )
    }
}