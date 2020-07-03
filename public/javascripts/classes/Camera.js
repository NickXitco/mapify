class Camera {
    x;
    y;
    height;
    width;
    zoom;

    startX;
    startY;
    startZoom;
    destX;
    destY;
    destZoom;
    frameCount;
    frameDone;
    moving;

    constructor(x, y, height, width, zoom) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.zoom = zoom;

        this.moving = false;
    }

    setCameraMove(x, y, zoom, frames) {
        this.startX = this.x;
        this.startY = this.y;
        this.startZoom = this.zoom;
        this.destX = x;
        this.destY = y;
        this.destZoom = zoom;
        this.frameDone = frames;
        this.frameCount = 0;
        this.moving = true;
    }

    doCameraMove() {
        if (!this.moving) {
            return;
        }

        const easeFrame = Eases.easeInSine(this.frameCount / this.frameDone);

        this.x = Utils.map(easeFrame, 0, 1, this.startX, this.destX);
        this.y = Utils.map(easeFrame, 0, 1, this.startY, this.destY);
        this.zoom = Utils.map(easeFrame, 0, 1, this.startZoom, this.destZoom);

        this.zoomCamera({x: this.x, y: this.y});

        this.frameCount++;
        if (this.frameCount > this.frameDone) {
            this.endMove();
        }
    }

    endMove() {
        this.moving = false;
        this.frameDone = 0;
        this.frameCount = 0;
    }

    zoomCamera(toward) {
        const oldHeight = this.height;
        const oldWidth = this.width;

        if (this.zoom < 6.42) {
            this.height = height * (1 / Math.pow(2, -0.5 * (this.zoom + 5)));
            this.width = width * (1 / Math.pow(2, -0.5 * (this.zoom + 5)));
        } else {
            this.height = height * (65 / (1 + Math.exp(-1 * (this.zoom - 5))));
            this.width = width * (65 / (1 + Math.exp(-1 * (this.zoom - 5))));
        }

        const pos = this.calculateZoomPos(toward, oldWidth, oldHeight);
        this.x = pos.x;
        this.y = pos.y;
    }

    /**
     * Approximate inverse of the zoom camera function
     * @param w
     */
    getZoomFromWidth(w) {
        return 2.88539 * Math.log(0.0001220703125 * w);
    }

    setZoomFromWidth(w) {
        this.zoom = this.getZoomFromWidth(w);
    }

    calculateZoomPos(toward, oldWidth, oldHeight) {
        const x = ((this.x - toward.x)/ oldWidth) * this.width + toward.x;
        const y = ((this.y - toward.y)/ oldHeight) * this.height + toward.y;
        return {x: x, y: y};
    }

    screen2virtual(point) {
        let x = point.x;
        let y = point.y;
        x = Utils.map(x, 0, width, this.x - (this.width / 2), this.x + (this.width / 2));
        y = Utils.map(y, 0, height, this.y + (this.height / 2), this.y - (this.height / 2));
        return {x: x, y: y};
    }

    virtual2screen(point) {
        let x = point.x;
        let y = point.y;
        x = Utils.map(x, this.x - (this.width / 2), this.x + (this.width / 2), 0, width);
        y = Utils.map(y, this.y + (this.height / 2), this.y - (this.height / 2), 0, height);
        return {x: x, y: y};
    }

    getZoomFactor() {
        return {x: width /  this.width, y: height / this.height};
    }

    setView() {
        const zoomFactor = this.getZoomFactor();
        translate(width / 2 - (this.x * zoomFactor.x), height / 2 + (this.y * zoomFactor.y));
        scale(zoomFactor.x, zoomFactor.y);
    }

    contains(q) {
        const l1 = {x: this.x - this.width / 2, y: this.y + this.height / 2};
        const r1 = {x: this.x + this.width / 2, y: this.y - this.height / 2};
        const l2 = {x: q.x - q.r, y: q.y + q.r};
        const r2 = {x: q.x + q.r, y: q.y - q.r};

        return !((l1.x >= r2.x || l2.x >= r1.x) || (l1.y <= r2.y || l2.y <= r1.y));
    }

    containsPoint(x, y) {
        return  x <= this.x + this.width / 2 && x >= this.x - this.width / 2 &&
                y >= this.y - this.height / 2 && y <= this.y + this.height / 2;
    }
}