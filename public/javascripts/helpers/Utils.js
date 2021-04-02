Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
}

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
     * Computes the latitude and longitude of a coordinate as projected onto the predefined stereographic
     * projection of the map. The radius of the projection is predefined and should not be changed.
     * @param x x-coordinate of the point
     * @param y y-coordinate of the point
     * @return {{latitude: number, longitude: number}}
     */
    latLong: function (x, y) {
        const RADIUS = 4457.086193532795 //DO NOT CHANGE UNLESS DATASET CHANGES

        const X = (x / RADIUS);
        const Y = (y / RADIUS);

        // Perform stereographic projection on (X, Y) to (X', Y', Z')
        const projX = (2 * X) / (1 + X * X + Y * Y);
        const projY = (2 * Y) / (1 + X * X + Y * Y);
        const projZ = (-1 + X * X + Y * Y) / (1 + X * X + Y * Y);

        const lat = ((Math.PI / 2) - Math.acos(projZ)) * (180 / Math.PI);
        const long = (Math.atan2(projY, projX) * (180 / Math.PI));

        return {
            longitude: long,
            latitude: lat
        }
    }
}