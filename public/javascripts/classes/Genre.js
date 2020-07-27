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

    //Thank you to Adam @ https://computergraphics.stackexchange.com/questions/5086/how-can-i-offset-shrink-a-triangular-polygon-in-glsl
    static incircle(A, B, C) {
        const a = Math.hypot(B.x - C.x, B.y - C.y);
        const b = Math.hypot(C.x - A.x, C.y - A.y);
        const c = Math.hypot(A.x - B.x, A.y - B.y);

        const abc = a + b + c;

        const I = {
            x: (a * A.x + b * B.x + c * C.x) / abc,
            y: (a * A.y + b * B.y + c * C.y) / abc
        };

        const r = 0.5 * Math.sqrt((-a + b + c) * (a - b + c) * (a + b - c) / abc);

        return {center: I, radius: r};
    }

    offsetHull(offsetAmount) {
        let shiftedHull = [];
        for (let i = 0; i < this.hull.length; i++) {
            const A = this.hull[(i - 1).mod(this.hull.length)];
            const B = this.hull[i];
            const C = this.hull[(i + 1).mod(this.hull.length)];

            const incircle = Genre.incircle(A, B, C);
            shiftedHull.push({
                x: B.x - (offsetAmount / incircle.radius) * (incircle.center.x - B.x),
                y: B.y - (offsetAmount / incircle.radius) * (incircle.center.y - B.y)
            })

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