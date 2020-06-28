Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
}

const Utils = {
    map: function(n, a, b, c, d) {
        return (n - a) / (b - a) * (d - c) + c;
    }
}