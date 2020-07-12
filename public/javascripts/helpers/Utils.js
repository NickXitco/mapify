Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
}

const Utils = {
    map: function(n, a, b, c, d) {
        return (n - a) / (b - a) * (d - c) + c;
    },

    dist: function(x1, y1, x2, y2) {
        return Math.hypot(x1 - x2, y1 - y2);
    }
}