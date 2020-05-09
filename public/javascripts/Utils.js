Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
}

class Utils {
    static map(n, a, b, c, d) {
        return (n - a) / (b - a) * (d - c) + c;
    }

    static randomEdges(u) {
        edges = [];
        for (let i = 0; i < NUM_EDGES; i++) {
            let v = vertices[Math.ceil(Math.random() * NUM_VERTICES - 1)];
            edges.push({
                u: u,
                v: v,
                cUrad: Math.random() / 2,
                cUang: Math.random() * MAX_CURVE_ANGLE - MAX_CURVE_ANGLE / 2,
                cVrad: Math.random() / 2,
                cVang: Math.random() * MAX_CURVE_ANGLE - MAX_CURVE_ANGLE / 2,
                tMax: 0
            });
        }
    }
}