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

    colorToStringAlpha(alpha) {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    }

    static fromString(string) {
        const split = string.split(/[\s,()]+/);
        console.log(split);

        let r = -1;
        let g = -1;
        let b = -1;

        for (const item of split) {
            if (!isNaN(Number(item))) {
                if (r === -1) {
                    r = Number(item);
                } else if (g === -1) {
                    g = Number(item);
                } else if (b === -1) {
                    b = Number(item);
                }
            }
        }

        return new Colorant(r, g, b, false);
    }
}
