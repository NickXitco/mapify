class ReactSearchBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {


        return (
            <div className={"searchBox"} onMouseEnter="SearchBox.focus()" onMouseLeave="SearchBox.unfocus()">
                <div className={"searchBar"}>
                    <input className={"searchInput"} type="text" placeholder="search for an artist..."/>
                </div>
                <ul className={"suggestions"}>
                </ul>
            </div>
        )
    }

}