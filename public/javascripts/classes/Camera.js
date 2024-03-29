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

    canvas;

    resolution;

    constructor(x, y, height, width, zoom, canvas, resolution) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.zoom = zoom;

        this.canvas = canvas;

        this.moving = false;

        this.resolution = resolution;
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

        const easeFrame = Eases.easeInOutSine(this.frameCount / this.frameDone);

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
            this.height = this.canvas.height * (1 / Math.pow(2, -0.5 * (this.zoom + 5)));
            this.width = this.canvas.width * (1 / Math.pow(2, -0.5 * (this.zoom + 5)));
        } else {
            this.height = this.canvas.height * (65 / (1 + Math.exp(-1 * (this.zoom - 5))));
            this.width = this.canvas.width * (65 / (1 + Math.exp(-1 * (this.zoom - 5))));
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
        const x = ((this.x - toward.x) / oldWidth) * this.width + toward.x;
        const y = ((this.y - toward.y) / oldHeight) * this.height + toward.y;
        return {x: x, y: y};
    }

    screen2virtual(point) {
        let x = point.x * resolution;
        let y = point.y * resolution;
        x = Utils.map(x, 0, this.canvas.width, this.x - (this.width / 2), this.x + (this.width / 2));
        y = Utils.map(y, 0, this.canvas.height, this.y + (this.height / 2), this.y - (this.height / 2));
        return {x: x, y: y};
    }

    virtual2screen(point) {
        let x = point.x;
        let y = point.y;
        x = Utils.map(x, this.x - (this.width / 2), this.x + (this.width / 2), 0, this.canvas.width);
        y = Utils.map(y, this.y + (this.height / 2), this.y - (this.height / 2), 0, this.canvas.height);
        return {x: x, y: y};
    }

    getZoomFactor() {
        return {x: this.canvas.width / this.width, y: this.canvas.height / this.height};
    }

    bubbleMove(bubble) {
        const camWidth = Math.min(5000, bubble.radius * 4);
        this.setCameraMove(bubble.center.x, bubble.center.y, this.getZoomFromWidth(camWidth), 45);
    }

    artistMove(artist) {
        this.setCameraMove(artist.x, artist.y, this.getZoomFromWidth(artist.size * 50), 45);
    }

    reset(frames) {
        this.setCameraMove(0, 0, 1, frames);
    }

    contains(q) {
        const l1 = {x: this.x - this.width / 2, y: this.y + this.height / 2};
        const r1 = {x: this.x + this.width / 2, y: this.y - this.height / 2};
        const l2 = {x: q.x - q.r, y: q.y + q.r};
        const r2 = {x: q.x + q.r, y: q.y - q.r};

        return !((l1.x >= r2.x || l2.x >= r1.x) || (l1.y <= r2.y || l2.y <= r1.y));
    }

    containsPoint(x, y) {
        return x <= this.x + this.width / 2 && x >= this.x - this.width / 2 &&
            y >= this.y - this.height / 2 && y <= this.y + this.height / 2;
    }

    containsRegion(x, y, r) {
        const l1 = {x: this.x - this.width / 2, y: this.y + this.height / 2};
        const r1 = {x: this.x + this.width / 2, y: this.y - this.height / 2};
        const l2 = {x: x - r, y: y + r};
        const r2 = {x: x + r, y: y - r};

        return !((l1.x >= r2.x || l2.x >= r1.x) || (l1.y <= r2.y || l2.y <= r1.y));
    }

    bound(x, y) {
        if (this.x > x) {
            this.x = x;
            if (MouseEvents.drifting) {
                MouseEvents.driftVec.x *= -1;
            }
        }

        if (this.x < -x) {
            this.x = -x;
            if (MouseEvents.drifting) {
                MouseEvents.driftVec.x *= -1;
            }
        }

        if (this.y > y) {
            this.y = y;
            if (MouseEvents.drifting) {
                MouseEvents.driftVec.y *= -1;
            }
        }

        if (this.y < -y) {
            this.y = -y;
            if (MouseEvents.drifting) {
                MouseEvents.driftVec.y *= -1;
            }
        }
    }
}