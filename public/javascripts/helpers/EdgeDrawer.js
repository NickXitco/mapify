const STROKE_DIVIDER = 5;
const EASE_SPEED = 25;
const EDGE_SEGMENTS = 50;
const ANGLE_THRESHOLD = 2;

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
        let t = 0;
        let brokeEarly = false;
        let numSegments = 0;

        let pointA, pointB, pointC;
        pointA = {x: u.x, y: -u.y, hue: uHue, sat: uSat, weight: u.size / STROKE_DIVIDER};
        t += 1 / EDGE_SEGMENTS;
        pointB = this.getPoint(t, u, v, uVec, vVec, uHue, vHue, dir, uSat, vSat);

        stroke(color(pointA.hue, pointA.sat, 100));
        strokeWeight(pointA.weight);
        beginShape();
        vertex(u.x, -u.y);

        while (t < e.tMax) {
            t += 1 / EDGE_SEGMENTS;

            pointC = this.getPoint(t, u, v, uVec, vVec, uHue, vHue, dir, uSat, vSat);

            if (!camera.containsPoint(pointC.x, -pointC.y)) {
                brokeEarly = true;
                vertex(pointB.x, pointB.y);
                endShape();
                beginShape();
                vertex(pointB.x, pointB.y);
                vertex(pointC.x, pointC.y);
                endShape();
                break;
            }

            if (this.needsSegmentBreak(pointA, pointB, pointC)) {
                vertex(pointB.x, pointB.y);
                endShape();
                beginShape();
                vertex(pointB.x, pointB.y);
                numSegments++;
            } 

            pointB = pointC;
        }

        if (e.tMax === 1 && !brokeEarly) {
            vertex(v.x, -v.y);
        }
        endShape();
        return numSegments;
    }

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
        let dAB = dist(a.x, a.y, b.x, b.y);
        let dBC = dist(b.x, b.y, c.x, c.y);
        let dAC = dist(a.x, a.y, c.x, c.y);
        let angleB = degrees(Math.acos((dAB * dAB + dBC * dBC - dAC * dAC) / (2 * dAB * dBC)));

        return Math.abs(180 - angleB % 180) >= ANGLE_THRESHOLD;
    }
}

