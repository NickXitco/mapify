const QuickHull = {
    getHull: function(points) {
        const hull = [];

        const extrema = this.getHorizontalExtrema(points);
        const A = this.rightOn(points, extrema.left, extrema.right);
        const B = this.rightOn(points, extrema.right, extrema.left);
        const qA = this.quickHalfHull(A, extrema.left, extrema.right);
        const qB = this.quickHalfHull(B, extrema.right, extrema.left);

        hull.push(extrema.left);
        hull.push(...qA);
        hull.push(extrema.right);
        hull.push(...qB);

        return hull;
    },

    getHorizontalExtrema: function (points) {
        let left, right;
        left = right = points[0];

        for (const point of points) {
            left = point.x < left.x ? point : left;
            right = point.x > right.x ? point : right;
        }

        return {left: left, right: right};
    },

    rightOn: function (points, u, v) {
        let subset = [];
        for (const point of points) {
            if (this.area2(point, u, v) <= 0) {
                subset.push(point);
            }
        }
        return subset;
    },

    quickHalfHull: function (points, u, v) {
        let halfHull = [];
        if (points.length <= 2) {
            return halfHull;
        }
        
        const p = this.furthest(points, u, v);
        if (p === null) {
            return halfHull;
        }
        
        const A = this.rightOn(points, u, p);
        const B = this.rightOn(points, p, v);
        const qA = this.quickHalfHull(A, u, p);
        const qB = this.quickHalfHull(B, p, v);
        
        halfHull.push(...qA);
        halfHull.push(p);
        halfHull.push(...qB);
        return halfHull;
    },

    area2: function(p, q, r) {
        let a = 0;
        a += (( q.x + p.x ) ) * ( q.y - p.y );
        a += (( r.x + q.x ) ) * ( r.y - q.y );
        a += (( p.x + r.x ) ) * ( p.y - r.y );
        return a;
    },
    
    furthest: function(points, u, v) {
        let largestArea = 0;
        let largestAreaPoint;

        for (const point of points) {
            const a = this.area2(point, u, v);
            if (a < largestArea) {
                largestArea = a;
                largestAreaPoint = point;
            }
        }

        if (largestArea === 0) {
            return null;
        }

        return largestAreaPoint;
    }
}