/**
 * All easings are from https://easings.net/.
 * Thank you to Andrey Sitnik and Ivan Solovev
 */
const Eases = {
    easeOutQuart: (x) => {return 1 - pow(1 - x, 4)},
    easeOutQuad: (x) => {return 1 - (1 - x) * (1 - x)},
    easeInSine: (x) => {return 1 - Math.cos((x * Math.PI) / 2)},
    easeInOutQuart: (x) => {return x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2}
}