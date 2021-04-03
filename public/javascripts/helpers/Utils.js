Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
}

const PLANE_RADIUS = 4457.086193532795 //DO NOT CHANGE UNLESS DATASET CHANGES

const Utils = {
    map: function(n, a, b, c, d) {
        return (n - a) / (b - a) * (d - c) + c;
    },

    dist: function(x1, y1, x2, y2) {
        return Math.hypot(x1 - x2, y1 - y2);
    },

    lerp: function(start, end, t) {
        return start + t * (end - start);
    },

    /***
     * Calculates the inverse of the gnomic projection of a plane onto a unit sphere
     * @param x x-coordinate of input point on plane
     * @param y y-coordinate of input point on plane
     * @param lambda0 - central longitude of projection
     * @param phi1 - central latitude of projection
     * @param r - max radius of plane
     * @return {{latitude: number, longitude: number}}
     */
    gnomicProjection: function(x, y, lambda0, phi1, r) {
        const X = x / r;
        const Y = y / r;
        const p = Math.hypot(X, Y);
        const c = Math.atan(p);

        const sinPhi1 = Math.sin(phi1);
        const cosPhi1 = Math.cos(phi1);
        const cosC = Math.cos(c);
        const sinC = Math.sin(c);

        let lat, long;

        if (p === 0) {
            lat = Math.asin(cosC * sinPhi1);
        } else {
            lat = Math.asin(cosC * sinPhi1 + ((Y * sinC * cosPhi1) / p));
        }

        long = lambda0 + Math.atan2(X * sinC, (p * cosPhi1 * cosC) - (Y * sinPhi1 * sinC));

        return {
            latitude: lat * (180 / Math.PI),
            longitude: long * (180 / Math.PI)
        }
    }
}