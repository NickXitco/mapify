class Eases {
    static easeOutQuart(x) {
        return 1 - pow(1 - x, 4);
    }

    static easeOutQuad(x) {
        return 1 - (1 - x) * (1 - x);
    }

    static easeInSine(x){
        return 1 - Math.cos((x * Math.PI) / 2);
    }

    static easeInOutQuart(x) {
        return x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2;
    }
}