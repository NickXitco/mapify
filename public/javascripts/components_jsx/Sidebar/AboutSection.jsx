class AboutSection extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false
        }

        this.titleClick = this.titleClick.bind(this);
    }

    titleClick() {
        this.setState({expanded: !this.state.expanded});
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