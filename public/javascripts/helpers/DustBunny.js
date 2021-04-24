class DustBunny {
    x
    y
    vx
    vy
    ax
    ay

    size
    r
    t

    xfactorE
    xfactorPi
    xfactor1
    xscaleE
    xscalePi
    xscale1
    axScale

    yfactorE
    yfactorPi
    yfactor1
    yscaleE
    yscalePi
    yscale1
    ayScale

    boundingW
    boundingH

    constructor(x, y, size, boundingW, boundingH) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.r = [
            Math.random(), Math.random(), Math.random(), Math.random()
        ]

        const SCALE_FACTOR = 50;

        this.vx = (Math.random() - 0.5) / SCALE_FACTOR;
        this.vy = (Math.random() - 0.5) / SCALE_FACTOR;
        this.ax = (Math.random() - 0.5) / SCALE_FACTOR;
        this.ay = (Math.random() - 0.5) / SCALE_FACTOR;

        this.xfactorE=Math.random() - 0.5;
        this.xfactorPi=Math.random() - 0.5;
        this.xfactor1=Math.random() - 0.5;
        this.xscaleE=Math.random() - 0.5;
        this.xscalePi=Math.random() - 0.5;
        this.xscale1=Math.random() - 0.5;
        this.axScale=Math.random() / SCALE_FACTOR;

        this.yfactorE=Math.random() - 0.5;
        this.yfactorPi=Math.random() - 0.5;
        this.yfactor1=Math.random() - 0.5;
        this.yscaleE=Math.random() - 0.5;
        this.yscalePi=Math.random() - 0.5;
        this.yscale1=Math.random() - 0.5;
        this.ayScale=Math.random() / SCALE_FACTOR;

        this.t = 0;

        this.boundingW = boundingW;
        this.boundingH = boundingH;
    }


    update() {
        this.t++;
        this.x += this.vx;
        this.y += this.vy;
        this.vx += this.ax;
        this.vy += this.ay;

        this.updateAcceleration();
        //this.quantumLeap();
        this.bounce();
    }

    static createDustBunnies(width, height, count) {
        const bunnies = [];
        for (let i = 0; i < count; i++) {
            bunnies.push(new DustBunny(
                Math.random() * width * 2 - width,
                Math.random() * height * 2 - height,
                Math.random(),
                width,
                height
            ))
        }
        return bunnies
    }

    static drawBunnies(dustBunnies, p, camera) {
        p.push();
        p.fill('rgba(250,247,237,0.66)');
        p.noStroke();
        for (const bunny of dustBunnies) {
            if (!camera.containsPoint(bunny.x, -bunny.y)) continue;
            p.rect(bunny.x, bunny.y, bunny.size, bunny.size,
                bunny.r[0], bunny.r[1], bunny.r[2], bunny.r[3]);
            bunny.update();
        }
        p.pop();
    }

    updateAcceleration() {
        this.ax = this.axScale * (this.xfactor1 * Math.sin(this.xscale1 * this.t) +
            this.xfactorE * Math.sin(this.xscaleE * Math.exp(1) * this.t) +
            this.xfactorPi * Math.sin(this.xscalePi * Math.PI * this.t));

        this.ay = this.ayScale * (this.yfactor1 * Math.sin(this.yscale1 * this.t) +
            this.yfactorE * Math.sin(this.yscaleE * Math.exp(1) * this.t) +
            this.yfactorPi * Math.sin(this.yscalePi * Math.PI * this.t));
    }

    quantumLeap() {
        if (this.x > window.innerWidth + 10) {
            this.x = -5;
        }

        if (this.x < -10) {
            this.x = window.innerWidth + 5;
        }

        if (this.y > window.innerHeight + 10) {
            this.y = -5;
        }

        if (this.y < 0) {
            this.y = window.innerHeight + 5;
        }
    }

    bounce() {
        if (this.x > this.boundingW || this.x < -this.boundingW) {
            this.vx *= -1;
        }

        if (this.y > this.boundingH || this.y < -this.boundingH) {
            this.vy *= -1;
        }
    }
}


