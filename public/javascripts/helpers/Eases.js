/**
 * All easings are from https://easings.net/.
 * Thank you to Andrey Sitnik and Ivan Solovev
 */
const Eases = {
    easeOutQuart: (x) => {return 1 - Math.pow(1 - x, 4)},
    easeOutQuad: (x) => {return 1 - (1 - x) * (1 - x)},
    easeInSine: (x) => {return 1 - Math.cos((x * Math.PI) / 2)},
    easeInOutQuart: (x) => {return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2},
    easeInOutElastic: (x) => {const c5 = (2 * Math.PI) / 4.5; return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2 : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;},
    easeInOutSine: (x) => {return -(Math.cos(Math.PI * x) - 1) / 2;}

}