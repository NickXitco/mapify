class Genre {
    name;

    hull;

    nodes;

    centroid;

    r;
    g;
    b;

    constructor(name, nodes, r, g, b) {
        this.name = name;
        this.nodes = nodes;
        this.r = r;
        this.g = g;
        this.b = b;

        this.hull = QuickHull.getHull([...nodes]);
        this.centroid = this.getCentroid(this.hull);
    }

    getCentroid() {
        const area = 1 / (6 * Genre.shoelaceArea(this.hull));
        let x = 0;
        let y = 0;
        for (let i = 0; i < this.hull.length; i++) {
            const u = this.hull[i];
            const v = this.hull[(i + 1) % this.hull.length];
            x += (u.x + v.x) * Genre.exteriorProduct(u, v);
            y += (u.y + v.y) * Genre.exteriorProduct(u, v);
        }
        return {x: area * x, y: area * y};
    }

    getWidth() {
        let easternmost = this.hull[0];
        let westernmost = this.hull[0];

        for (const point of this.hull) {
            easternmost = point.x > easternmost.x ? point : easternmost;
            //We don't have to update westernmost because genreHull[0] will always be the leftmost extrema
        }

        return Math.abs(easternmost.x - westernmost.x);
    }

    static shoelaceArea(points) {
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            area += Genre.exteriorProduct(points[i], points[(i + 1) % points.length])
        }
        return area * 0.5;
    }

    static exteriorProduct(u, v) {
        return (u.x * v.y - v.x * u.y);
    }

    offsetHull(hull, centroid, offsetAmount) {
        let shiftedHull = [];
        for (const point of hull) {
            const shiftX = point.x - centroid.x;
            const shiftY = point.y - centroid.y;
            const scale = 1 + (offsetAmount / Math.sqrt(shiftX * shiftX + shiftY * shiftY));
            shiftedHull.push({x: point.x * scale, y: point.y * scale});
        }
        return shiftedHull;
    }


    colorToString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`
    }

    colorOpacityToString(opacity) {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${opacity})`
    }
}