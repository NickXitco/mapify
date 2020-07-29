class Changelog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const changelist = this.props.changes.map((change, index) =>
            <li className={"changelog-list-item"}
                key={index.toString()}
            >
                {change}
            </li>
        );

        const upcoming = this.props.upcoming.map((change, index) =>
            <li className={"changelog-list-item"}
                key={index.toString()}
            >
                {change}
            </li>
        );

        return (
            <div className="changelog"
                 onClick={() => {
                     this.props.tryRemoveChangelog()}
                 }
            >
                <div className="changelog-inner"
                     onMouseEnter={() => {
                         this.props.updateHoverFlag(true)}
                     }
                     onMouseLeave={() => {
                         this.props.updateHoverFlag(false)}
                     }
                >
                    <h2>Version {this.props.version}</h2>
                    <h3>{this.props.headline}</h3>
                    <ul className="changelog-list" style={{marginTop: "30px", marginBottom: "30px"}}>
                        {changelist}
                    </ul>
                    <h3>Upcoming Features</h3>
                    <ul className="changelog-list" style={{marginTop: "30px"}}>
                        {upcoming}
                    </ul>
                </div>
            </div>
        );
    }
}