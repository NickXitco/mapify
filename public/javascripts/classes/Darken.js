class Darken {
    related
    genre
    sp

    relatedGraphics
    genreGraphics
    spGraphics

    constructor() {
        this.related = 0;
        this.genre = 0;
        this.sp = 0;
        this.relatedGraphics = new PIXI.Graphics();
        this.genreGraphics = new PIXI.Graphics();
        this.spGraphics = new PIXI.Graphics();
        this.initAll();
    }


    initGraphics(graphics) {
        graphics.beginFill(0x030303);
        graphics.drawRect(-5000, -5000, 10000, 10000);
        graphics.alpha = 0;
    }

    initAll() {
        this.initGraphics(this.relatedGraphics);
        this.initGraphics(this.genreGraphics);
        this.initGraphics(this.spGraphics);
    }

    runDarkening(objectCheck, type) {
        let graphics, parameter;
        switch (type) {
            case 'related':
                graphics = this.relatedGraphics;
                parameter = this.related;
                break;
            case 'genre':
                graphics = this.genreGraphics;
                parameter = this.genre;
                break;
            case 'sp':
                graphics = this.spGraphics;
                parameter = this.sp;
                break;
            default:
                return;
        }
        graphics.alpha = (Eases.easeOutQuart(parameter) * 215) / 255;

        const newParam = objectCheck ? Math.min(parameter + 0.05, 1) : Math.max(parameter - 0.15, 0);
        switch (type) {
            case 'related':
                this.related = newParam;
                break;
            case 'genre':
                this.genre = newParam;
                break;
            case 'sp':
                this.sp = newParam;
                break;
        }
    }
}