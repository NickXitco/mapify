class Colorant {
    r;
    g;
    b;

    constructor(r, g, b, noBlack) {
        if (noBlack && r === 0 && g === 0 && b === 0) {
            this.r = 127;
            this.g = 127;
            this.b = 127;
        } else {
            this.r = r;
            this.g = g;
            this.b = b;
        }
    }

    colorToString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
}
