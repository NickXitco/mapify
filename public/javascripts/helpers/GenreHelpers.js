const GenreHelpers = {
    genreNodes: new Set(),
    genreHull: [],
    genrePoint: {},
    genreName: "",
    genreColor: null,

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