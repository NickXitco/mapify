const GenreHelpers = {
    genreNodes: [],
    genreHull: [],
    genrePoint: {},

    getGenre: async function(genreName) {
        const response = await fetch('genre/' + genreName);
        const data = await response.json();

        if (data.length === 0) {
            return;
        }


        let nodesList = []
        for (const node of data) {
            createNewNode(node);
            nodesList.push(nodeLookup[node.id]);
        }

        this.genreHull = QuickHull.getHull(nodesList);

        let pointSum = {x: 0, y: 0};
        let easternmost = this.genreHull[0];
        let westernmost = this.genreHull[0];

        for (const point of this.genreHull) {
            pointSum.x += point.x;
            pointSum.y += point.y;

            easternmost = point.x > easternmost.x ? point : easternmost;
            //We don't have to update westernmost because genreHull[0] will always be the leftmost extrema
        }

        const averagePoint = {x: pointSum.x / this.genreHull.length, y: pointSum.y / this.genreHull.length};
        this.genrePoint = averagePoint;

        const cameraWidth = Math.abs(easternmost.x - westernmost.x);
        camera.setCameraMove(averagePoint.x, averagePoint.y, camera.getZoomFromWidth(cameraWidth), 30);

        clickedArtist = null;
        this.genreNodes = nodesList;

        Sidebar.resetSidebar(false);
        Sidebar.setGenreSidebar();
    },

    resetGenreView: function() {
        this.genreNodes = [];
        this.genreHull = [];
        this.genrePoint = {};
    }
}