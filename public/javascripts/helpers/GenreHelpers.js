const GenreHelpers = {
    genreNodes: new Set(),
    genreHull: [],
    genrePoint: {},
    genreName: "",
    genreColor: null,

    getGenre: async function(p, camera, genreName, quadHead, nodeLookup) {
        const response = await fetch('genre/' + genreName);
        const data = await response.json();

        if (data.artists.length === 0) {
            return false;
        }

        this.genreName = data.name;
        this.genreColor = p.color(data.r, data.g, data.b);

        let nodesList = []
        for (const node of data.artists) {
            createNewNode(p, node, quadHead, nodeLookup);
            nodesList.push(nodeLookup[node.id]);
        }

        this.genreHull = QuickHull.getHull(nodesList);

        let easternmost = this.genreHull[0];
        let westernmost = this.genreHull[0];

        for (const point of this.genreHull) {
            easternmost = point.x > easternmost.x ? point : easternmost;
            //We don't have to update westernmost because genreHull[0] will always be the leftmost extrema
        }

        const averagePoint = this.getCentroid(this.genreHull);
        this.genrePoint = averagePoint;

        const cameraWidth = Math.abs(easternmost.x - westernmost.x);
        camera.setCameraMove(averagePoint.x, averagePoint.y, camera.getZoomFromWidth(cameraWidth), 30);

        this.genreNodes = new Set(nodesList);

        Sidebar.resetSidebar(false);
        Sidebar.setGenreSidebar(p, quadHead, nodeLookup);
        return true;
    },

    resetGenreView: function() {
        this.genreNodes.clear();
        this.genreHull = [];
        this.genrePoint = {};
    },

    shoelaceArea: function(points) {
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            area += this.exteriorProduct(points[i], points[(i + 1) % points.length])
        }
        return area * 0.5;
    },

    exteriorProduct: function(u, v) {
        return (u.x * v.y - v.x * u.y);
    },

    getCentroid: function(points) {
        const area = 1 / (6 * this.shoelaceArea(points));
        let x = 0;
        let y = 0;
        for (let i = 0; i < points.length; i++) {
            const u = points[i];
            const v = points[(i + 1) % points.length];
            x += (u.x + v.x) * this.exteriorProduct(u, v);
            y += (u.y + v.y) * this.exteriorProduct(u, v);
        }
        return {x: area * x, y: area * y};
    },

    offsetHull: function(hull, centroid, offsetAmount) {
        let shiftedHull = [];
        for (const point of hull) {
            const shiftX = point.x - centroid.x;
            const shiftY = point.y - centroid.y;
            const scale = 1 + (offsetAmount / Math.sqrt(shiftX * shiftX + shiftY * shiftY));
            shiftedHull.push({x: point.x * scale, y: point.y * scale});
        }
        return shiftedHull;
    }
}