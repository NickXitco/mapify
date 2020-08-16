class FollowersStats extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {


        return(
            <div className={this.props.size === "Small" ? "followersSectionSmall" : "followersSection"}>
                <p className={"followerCount"}>
                    {this.props.artist.followers >= 1000000
                        ? (this.props.artist.followers * 1.0 / 1000000).toFixed(1).toString() + " Million"
                    :this.props.artist.followers >= 1000
                        ? (this.props.artist.followers * 1.0 / 1000).toFixed(1).toString() + " Thousand"
                    :this.props.artist.followers.toString()}
                </p>
                <p className={"followers"}>
                    {this.props.artist.followers === 1 ? "Follower" : "Followers"}
                </p>
                <p className={"followerRanking"}/>
            </div>
        );
    }
}