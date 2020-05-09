const STROKE_DIVIDER = 5;
const EASE_SPEED = 25;

const TEXT_DRAW_THRESHOLD = 7.5;
const TEXT_OFFSET = 0.25;

const BLUR_SIZE = 2.27
const GLOW_SPEED = 10;

class DrawingHelpers {
    static drawEdge(e) {
        const u = e.u;
        const v = e.v;

        const uVec = createVector(u.x, u.y);
        const vVec = createVector(v.x, v.y);

        push();
        uVec.lerp(vVec, e.cUrad);
        vVec.lerp(uVec, e.cVrad);
        uVec.sub(u.x, u.y);
        vVec.sub(v.x, v.y);
        uVec.rotate(e.cUang);
        vVec.rotate(e.cVang);
        uVec.add(u.x, u.y);
        vVec.add(v.x, v.y);

        stroke(u.color);

        stroke('white');
        beginShape();
        vertex(u.x, -u.y);
        colorMode(HSB)

        let uHue = hue(u.color);
        let vHue = hue(v.color);
        let uSat = saturation(u.color);
        let vSat = saturation(v.color);
        let dir;

        if (vHue > uHue) {
            if (uHue >= 145) {
                dir = 1;
            } else if (vHue - uHue > (360 + uHue) - vHue) {
                dir = -1;
            } else {
                dir = 1;
            }
        } else {
            if (vHue >= 145) {
                dir = -1;
            } else if (uHue - vHue > (360 + vHue) - uHue) {
                dir = 1;
            } else {
                dir = -1;
            }
        }

        for (let t = 0; t < DrawingHelpers.edgeEase(e.tMax); t += 0.01) {
            let tV = {x: Math.pow(1 - t, 3) * u.x + 3 * Math.pow(1 - t, 2) * t * uVec.x + 3 * (1 - t) * Math.pow(t, 2) * vVec.x + Math.pow(t, 3) * v.x,
                y: Math.pow(1 - t, 3) * -u.y + 3 * Math.pow(1 - t, 2) * t * -uVec.y + 3 * (1 - t) * Math.pow(t, 2) * -vVec.y + Math.pow(t, 3) * -v.y};

            let newHue = DrawingHelpers.hueLerp(uHue, vHue, t, dir);
            stroke(color(newHue, lerp(uSat, vSat, t), 100));
            strokeWeight(lerp(u.size / STROKE_DIVIDER, v.size / STROKE_DIVIDER, t));
            vertex(tV.x, tV.y);
            endShape();
            beginShape();
            vertex(tV.x, tV.y);
        }
        if (e.tMax === 1) {
            vertex(v.x, -v.y);
        }
        endShape();
        pop();

        e.tMax = min(1, e.tMax + (EASE_SPEED / dist(u.x, u.y, v.x, v.y)));
    }

    static nodeText(v) {
        const zF = camera.getZoomFactor();

        if (zF.x * (v.size / 2) < TEXT_DRAW_THRESHOLD) {
            return;
        }

        push();
        noStroke();
        fill(255);
        textSize(v.size / 2);
        textAlign(CENTER);
        text(v.text, v.x, - v.y + v.size + v.size * TEXT_OFFSET);
        pop();
    }

    static glowCircle(v) {
        push();
        stroke(v.color);
        strokeWeight(0.15 * v.size);

        let h = v.color.levels;

        if (doGlow) {
            tint(h[0], h[1], h[2], v.glowPacity);
            v.glowPacity = min(255, v.glowPacity + GLOW_SPEED);
            image(blur, v.x - BLUR_SIZE * 0.5 * v.size,
                - v.y - BLUR_SIZE * 0.5 * v.size,
                BLUR_SIZE * v.size,
                BLUR_SIZE *  v.size, 0, 0);
        } else {
            v.glowPacity = 0;
        }

        if (highlightedVertex === v) {
            fill(h[0], h[1], h[2], 75);
        }
        circle(v.x, -v.y, v.size);
        pop();
    }

    static hueLerp(start, end, x, dir) {
        if (dir === 1) {
            return (start + (x * ((end - start).mod(360) * dir))).mod(360);
        } else {
            return (start + (x * ((start - end).mod(360) * dir))).mod(360);
        }
    }

    static edgeEase(x) {
        return 1 - (1 - x) * (1 - x);
    }

    static drawVertices(visibleVertices) {
        for (const v of visibleVertices) {
            DrawingHelpers.glowCircle(v);
            DrawingHelpers.nodeText(v);
            v.visible = false;
        }
    }

    static drawEdges(edges) {
        for (const e of edges) {
            DrawingHelpers.drawEdge(e);
        }
    }

}