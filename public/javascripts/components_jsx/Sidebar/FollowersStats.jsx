class FollowersStats extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {


        return(
            <div className={this.props.size === "Small" ? "followersSectionSmall" : "followersSection"}>
                <p className={"followerCount"}>
                    {this.props.number >= 1000000
                        ? (this.props.number * 1.0 / 1000000).toFixed(1).toString() + " Million"
                    :this.props.number >= 1000
                        ? (this.props.number * 1.0 / 1000).toFixed(1).toString() + " Thousand"
                    :this.props.number.toString()}
                </p>
                <p className={"followers"}>
                    {this.props.number === 1 ? this.props.text : this.props.text + "s"}
                </p>
                <p className={"followerRanking"}/>
            </div>
        );
    }
}