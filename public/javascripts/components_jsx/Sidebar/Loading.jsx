const LOADING_MESSAGES = [
    "Test message...",
    "Test message twenty...",
    "We have liftoff! Soon..."
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
            3000
        );
    }

    componentWillUnmount() {
        clearInterval(this.loadingInterval);
    }

    tick() {
        this.setState({
            splashIndex: (this.state.splashIndex + 1) % LOADING_MESSAGES.length
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