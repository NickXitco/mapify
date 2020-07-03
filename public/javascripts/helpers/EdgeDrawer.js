const STROKE_DIVIDER = 5;
const EASE_SPEED = 10;
const EDGE_SEGMENTS = 32;
const ANGLE_THRESHOLD = 1;

class EdgeDrawer {
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

        let uHSV = ColorUtilities.rgb2hsv(red(u.color), green(u.color), blue(u.color));
        let vHSV = ColorUtilities.rgb2hsv(red(v.color), green(v.color), blue(v.color));

        let uHue = uHSV.h;
        let vHue = vHSV.h;
        let uSat = uHSV.s;
        let vSat = vHSV.s;

        let dir;
        colorMode(HSB);
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

        let numSegments = this.runEdgeDrawer(e, u, v, uVec, vVec, uHue, vHue, dir, uSat, vSat);

        fill('white');
        noStroke();
        textSize(50);
        text(numSegments, v.x, -v.y);
        pop();

        e.tMax = Math.min(1, e.tMax + (EASE_SPEED / dist(u.x, u.y, v.x, v.y)));


    }

    static runEdgeDrawer(e, u, v, uVec, vVec, uHue, vHue, dir, uSat, vSat) {
        let segmentNumber = 0;
        let tMax = e.tMax.valueOf();
        let t = 0;

        let pointA, pointB;

        pointA = {x: u.x, y: -u.y, hue: uHue, sat: uSat, weight: u.size / STROKE_DIVIDER};

        stroke(color(pointA.hue, pointA.sat, 100));
        strokeWeight(pointA.weight);

        textSize(15);


        while (t < tMax) {
            t = Math.min(tMax, t + (1 / EDGE_SEGMENTS));
            pointB = this.getPoint(t, u, v, uVec, vVec, uHue, vHue, dir, uSat, vSat);
            stroke(color(pointB.hue, pointB.sat, 100));
            strokeWeight(pointB.weight);
            noFill();
            circle(pointB.x, pointB.y, pointB.weight * STROKE_DIVIDER);
            noStroke();
            fill('white');
            text(t, pointB.x, pointB.y);
            segmentNumber++;
        }



        return segmentNumber;
    }

    /* TODO

    1. Each segment needs to be the same length.
    2. If u is offscreen, or rather, the first point is offscreen, the line will not be drawn.
    3. The line draws continuously, not segment by segment.

     */


    static getPoint(t, u, v, uVec, vVec, uHue, vHue, dir, uSat, vSat) {
        const tEased = Eases.easeOutQuad(t);

        let tV = {
            x: Math.pow(1 - tEased, 3) * u.x + 3 * Math.pow(1 - tEased, 2) * tEased * uVec.x + 3 * (1 - tEased) * Math.pow(tEased, 2) * vVec.x + Math.pow(tEased, 3) * v.x,
            y: Math.pow(1 - tEased, 3) * -u.y + 3 * Math.pow(1 - tEased, 2) * tEased * -uVec.y + 3 * (1 - tEased) * Math.pow(tEased, 2) * -vVec.y + Math.pow(tEased, 3) * -v.y
        };

        let newHue = ColorUtilities.hueLerp(uHue, vHue, tEased, dir);
        let newSat = lerp(uSat, vSat, tEased);
        let newWeight = lerp(u.size / STROKE_DIVIDER, v.size / STROKE_DIVIDER, tEased);

        return {x: tV.x, y: tV.y, hue: newHue, sat: newSat, weight: newWeight};
    }

    static needsSegmentBreak(a, b, c) {
        return true;
        let dAB = dist(a.x, a.y, b.x, b.y);
        let dBC = dist(b.x, b.y, c.x, c.y);
        let dAC = dist(a.x, a.y, c.x, c.y);
        let angleB = degrees(Math.acos((dAB * dAB + dBC * dBC - dAC * dAC) / (2 * dAB * dBC)));

        return Math.abs(180 - angleB % 180) >= ANGLE_THRESHOLD;
    }
}

