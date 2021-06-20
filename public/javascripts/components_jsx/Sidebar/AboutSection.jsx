class AboutSection extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded: true
        }

        this.titleClick = this.titleClick.bind(this);
    }

    titleClick() {
        this.setState({expanded: true});
    }

    render() {
        const sectionClass = this.state.expanded ? 'aboutSectionOpen' : 'aboutSectionClosed';

        return (
            <div className={'aboutSection'}>
                <h2 onClick={this.titleClick}>
                    {this.props.title}
                </h2>
                <div className={`aboutSectionContent ${sectionClass}`}>
                    {this.props.content}
                </div>
            </div>
        )
    }
}