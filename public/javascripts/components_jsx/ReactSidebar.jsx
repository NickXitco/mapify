class Clock extends React.Component{
    constructor(props) {
        super(props);
        this.state = {date: new Date()};
    }

    //Allocate and set up resources when the clock is rendered
    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    //Remove anc clear resources when the clock is removed
    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({
            date: new Date()
        });
    }

    render() {
        return (
            <div>
                <h1>Hello, world!</h1>
                <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
            </div>
        );
    }

    /*
        https://reactjs.org/docs/state-and-lifecycle.html
     */
}




class ReactSidebar extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className={"sidebar"}>
                <div className={"sidebarStroke"}/>
                <div className={"nameAndPicture"}>
                    <div className={"sidebarPicture"}/>
                    <div className={"name"}>
                        <h1 className={"sidebarArtistName"}/>
                    </div>
                </div>

                <div className={"followersSection"}>
                    <p className={"followerCount"}/>
                    <p className={"followers"}/>
                    <p className={"followerRanking"}/>
                </div>

                <div className={"genresSection"}>
                    <h2>Genres</h2>
                    <ul className={"genresList"}/>
                </div>

                <div className={"relatedArtistsSection"}>
                    <h2>Related Artists</h2>
                    <ul className={"relatedArtistsList"}/>
                </div>
            </div>
        );
    }
}