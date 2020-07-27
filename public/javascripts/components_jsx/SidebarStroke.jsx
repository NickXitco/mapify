class SidebarStroke extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const strokeStyle = {
            boxShadow: "0 0 13px 1px " + this.props.color,
            background: this.props.color,
        };

        return <div className={"sidebarStroke"} style={strokeStyle}/>
    }
}