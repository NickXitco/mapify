class Genre {
    name;

    hull;
    offsetHull;

    nodes;

    centroid;

    bubble;

    r;
    g;
    b;

    constructor(name, nodes, r, g, b, bubbleThreshold) {
        this.name = name;
        this.nodes = nodes;
        this.r = r;
        this.g = g;
        this.b = b;

        this.hull = QuickHull.getHull([...nodes]);
        this.offsetHull = this.getOffsetHull(20);
        this.centroid = Genre.centroid(this.hull);
        this.bubble = this.getBubble(bubbleThreshold);
    }

    getBubble(percentageThreshold) {
        if (percentageThreshold > 1) {
            return [...this.nodes];
        }

        let averagePoint = {x: 0, y: 0};
        let i = 0;
        for (const point of this.nodes) {
            averagePoint.x = (i * averagePoint.x + point.x) / (i + 1);
            averagePoint.y = (i * averagePoint.y + point.y) / (i + 1);
            i++;
        }

        function distance(a, b) {
            return Math.hypot(a.x - b.x, a.y - b.y);
        }

        let closestToAverage = null;
        for (const point of this.nodes) {
            if (!closestToAverage) {closestToAverage = point; continue;}
            if (distance(averagePoint, point) < distance(averagePoint, closestToAverage)) {
                closestToAverage = point;
            }
        }

        let bubble = new Set();
        bubble.add(closestToAverage);
        let radius = 0;
        let bubbleAverage = {x: closestToAverage.x, y: closestToAverage.y};

        while (bubble.size < this.nodes.size * percentageThreshold) {
            let nearest = null;
            for (const point of this.nodes) {
                if (bubble.has(point)) continue;
                if (!nearest) {nearest = point; continue;}
                if (distance(bubbleAverage, point) < distance(bubbleAverage, nearest)) {
                    nearest = point;
                }
            }

            const n = bubble.size;
            bubbleAverage.x = (n * bubbleAverage.x + nearest.x) / (n + 1);
            bubbleAverage.y = (n * bubbleAverage.y + nearest.y) / (n + 1);
            bubble.add(nearest);
        }

        for (const point of bubble) {
            radius = Math.max(radius, distance(bubbleAverage, point), 10);
        }

        return {nodes: [...bubble], radius: radius, center: Genre.centroid(QuickHull.getHull([...bubble]))};
    }

    static centroid(points) {
        if (points.length === 1) return {x: points[0].x, y: points[0].y};
        if (points.length === 2) return {x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2};

        const area = 1 / (6 * Genre.shoelaceArea(points));
        let x = 0;
        let y = 0;
        for (let i = 0; i < points.length; i++) {
            const u = points[i];
            const v = points[(i + 1) % points.length];
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

    getHeight() {
        let northernmost = this.hull[0];
        let southernmost = this.hull[0];

        for (const point of this.hull) {
            northernmost = point.y < northernmost.y ? point : northernmost;
            southernmost = point.y > southernmost.y ? point : southernmost;
        }

        return Math.abs(northernmost.y - southernmost.y);
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

    getOffsetHull(offsetAmount) {
        let offsetHull = [];
        for (let i = 0; i < this.hull.length; i++) {
            const A = this.hull[(i - 1).mod(this.hull.length)];
            const B = this.hull[i];
            const C = this.hull[(i + 1).mod(this.hull.length)];

            const incircle = Genre.incircle(A, B, C);
            offsetHull.push({
                x: B.x - (offsetAmount / incircle.radius) * (incircle.center.x - B.x),
                y: B.y - (offsetAmount / incircle.radius) * (incircle.center.y - B.y)
            })

        }

        return offsetHull;
    }

    drawGenreFence(p, showDebug) {
        p.push();

        p.stroke(p.color(this.r, this.g, this.b));
        p.noFill();
        p.strokeWeight(2);
        p.beginShape();

        for (const point of this.offsetHull) {
            p.vertex(point.x, -point.y);
        }
        p.vertex(this.offsetHull[0].x, -this.offsetHull[0].y);
        p.endShape();

        if (showDebug) {
            p.rect(this.centroid.x, -this.centroid.y, this.getWidth() / 2, this.getHeight() / 2);

            p.noFill();
            p.circle(this.bubble.center.x, -this.bubble.center.y, this.bubble.radius * 2);
        }

        p.pop();
    }


    colorToString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`
    }

    colorOpacityToString(opacity) {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${opacity})`
    }
}