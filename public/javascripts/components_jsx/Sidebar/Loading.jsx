const LOADING_MESSAGES = [
    "Loading sidebar...",
    "Reticulating splines...",
    "Liftoff in...",
    "Shortening some paths...",
    "Listening to some tunes...",
    "Warming up the orchestra...",
    "Triangulating parsecs...",
    "Are we there yet?",
    "Making it glow...",
    "Exiting the atmosphere...",
    "Counting edges...",
    "Constructing pylons...",
    "Taking a deep breath...",
    "Wrangling nodes...",
    "Getting in formation...",
    "Punching the clock...",
    "Breaking the chain...",
    "Finishing the rhyme...",
    "Blooming in a dark room...",
    "Opening house doors...",
    "Rushing or dragging...",
    "Flattening curves...",
    "Take your time...",
    "There is no cow level...",
    "640K ought to be enough for anybody...",
    "Dreaming of electric sheep...",
    "Aligning covariance matrices...",
    "Graphing whale migration...",
    "Obfuscating quigley matrix...",
    "Please wait while the little elves draw your map...",
    "It's still faster than You could draw it...",
    "Realigning alternate time frames...",
    "Turbo boosting...",
    "Pinging for help...",
    `You are ticket #${Math.floor(Math.random() * 1000000000).toFixed(0)}...`,
    "Inside a saltwater room...",
    "The jar is under the bed...",
    "Like an accordion...",
    "Playing the spit fountain riff...",
    "Over hill, over dale...",
    "Playing the 4-7-3-6-2-5-1...",
    "Waving from such great heights...",
    "Everybody look what's going down...",
    "Any way the wind blows...",
    "Playing a show at the Élysée Montmartre...",
    "Learning the tricks from Bricks to Kingston...",
    "Skrrah, pop, pop, ka-ka-ka...",
    "Wishin' and wishin' and wishin'...",
    "Adaptive circuits engaging...",
    "Playing the lick...",
]

class Loading extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            splashIndex: Math.floor(Math.random() * LOADING_MESSAGES.length)
        }

        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        this.loadingInterval = setInterval(
            () => this.tick(),
            2750
        );
    }

    componentWillUnmount() {
        clearInterval(this.loadingInterval);
    }

    tick() {
        this.setState({
            splashIndex: Math.floor(Math.random() * LOADING_MESSAGES.length)
        });
    }

    render() {
        return (
            <div className={"loadingContainer"}>
                <div className={"loadingItems"}>
                    <img src="../../../images/loading.gif" alt="Loading Gif" className={"loadingIcon"}/>
                    <p className={"loadingText"}>{LOADING_MESSAGES[this.state.splashIndex]}</p>
                </div>
            </div>
        )
    }
}