Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
}

class Utils {
    static map(n, a, b, c, d) {
        return (n - a) / (b - a) * (d - c) + c;
    }
}