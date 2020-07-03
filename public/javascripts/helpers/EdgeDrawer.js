const STROKE_DIVIDER = 5;
const EASE_SPEED = 25;
const MAX_EDGE_SEGMENTS = 64;
const ANGLE_THRESHOLD = 178;
const HUE_THRESHOLD = 4;
const SAT_THRESHOLD = 2;
const WEIGHT_THRESHOLD = 1.1;


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

        this.runEdgeDrawer(e, u, v, uVec, vVec, uHue, vHue, uSat, vSat);
        pop();

        e.tMax = Math.min(1, e.tMax + (EASE_SPEED / dist(u.x, u.y, v.x, v.y)));
    }

    static runEdgeDrawer(e, u, v, uVec, vVec, uHue, vHue, uSat, vSat) {
        let edgePoints = this.getEdgePoints(u, uHue, uSat, e.tMax, v, uVec, vVec, vHue, vSat);
        let finalEdgePoints = this.reduceEdgePoints(edgePoints);
        this.drawEdgePoints(finalEdgePoints);
        return finalEdgePoints.length;
    }

    static drawEdgePoints(points) {
        textSize(15);

        for (let i = 0; i < points.length; i++) {
            if (i === 0) {
                beginShape();
                vertex(points[i].x, points[i].y);
            } else if (i === points.length - 1) {
                vertex(points[i].x, points[i].y);
                endShape();
            } else {
                vertex(points[i].x, points[i].y);
                endShape();
                beginShape();
                vertex(points[i].x, points[i].y);
            }
            stroke(color(points[i].hue, points[i].sat, 100));
            strokeWeight(points[i].weight);
        }
    }

    static reduceEdgePoints(edgePoints) {
        edgePoints = this.flatten(edgePoints);
        edgePoints = this.removeOutOfView(edgePoints);
        return edgePoints;
    }

    static removeOutOfView(edgePoints) {
        const pointsInView = []
        let lastIn = camera.containsPoint(edgePoints[0].x, -edgePoints[0].y);
        for (let i = 0; i < edgePoints.length; i++) {
            const inView = camera.containsPoint(edgePoints[i].x, -edgePoints[i].y);
            if (inView) {
                if (!lastIn) {
                    pointsInView.push(edgePoints[i - 1]);
                }
                pointsInView.push(edgePoints[i]);
                lastIn = true;
                continue;
            }

            if (lastIn) {
                pointsInView.push(edgePoints[i]);
                lastIn = false;
            }
        }

        return pointsInView;
    }

    static flatten(edgePoints) {
        let flattened = [];

        let a = 0;
        let b = 1;
        let c = 2;

        flattened.push(edgePoints[a]);
        if (edgePoints.length === 2) {
            flattened.push(edgePoints[b]);
        }

        while (c < edgePoints.length) {
            let angle = this.getMiddleAngle(edgePoints, a, b, c);
            let hueDif = this.getHueDif(edgePoints[a].hue, edgePoints[c].hue);
            let satDif = Math.abs(edgePoints[a].sat - edgePoints[c].sat);
            let weightRatio =  Math.max(edgePoints[a].weight, edgePoints[c].weight) / Math.min(edgePoints[a].weight, edgePoints[c].weight);

            edgePoints[c].angle = angle;

            if (angle < ANGLE_THRESHOLD || hueDif > HUE_THRESHOLD || satDif > SAT_THRESHOLD || weightRatio > WEIGHT_THRESHOLD) {
                //Push point B, move A, B, and C along the line.
                flattened.push(edgePoints[b]);
                a = b;
                b = c;
                c++;
            } else {
                //Don't push point B, move B and C along the line
                b = c;
                c++;
            }
        }

        if (edgePoints.length > 2) {
            flattened.push(edgePoints[edgePoints.length - 1]);
        }
        return flattened;
    }

    static getHueDif(a, b) {
        return Math.min((a - b).mod(360), (b - a).mod(360));
    }

    static getEdgePoints(u, uHue, uSat, tMax, v, uVec, vVec, vHue, vSat) {
        let edgePoints = [];
        edgePoints.push({x: u.x, y: -u.y, hue: uHue, sat: uSat, weight: u.size / STROKE_DIVIDER});

        let t = 0;
        while (t < tMax) {
            t = Math.min(tMax, t + (1 / MAX_EDGE_SEGMENTS));
            edgePoints.push(this.getPoint(t, u, v, uVec, vVec, uHue, vHue, uSat, vSat));
        }
        return edgePoints;
    }

    static getMiddleAngle(edgePoints, a, b, c) {
        let dAB = dist(edgePoints[a].x, edgePoints[a].y, edgePoints[b].x, edgePoints[b].y);
        let dBC = dist(edgePoints[b].x, edgePoints[b].y, edgePoints[c].x, edgePoints[c].y);
        let dAC = dist(edgePoints[a].x, edgePoints[a].y, edgePoints[c].x, edgePoints[c].y);
        return degrees(Math.acos((dAB * dAB + dBC * dBC - dAC * dAC) / (2 * dAB * dBC)));
    }

    /* TODO
        1. Each segment needs to be the same length. UNNECESSARY
        2. If u is offscreen, or rather, the first point is offscreen, the line will not be drawn.
        3. The line draws continuously, not segment by segment. DONE
    */


    static getPoint(t, u, v, uVec, vVec, uHue, vHue, uSat, vSat) {
        const tEased = Eases.easeOutQuad(t);

        let tV = {
            x: Math.pow(1 - tEased, 3) * u.x + 3 * Math.pow(1 - tEased, 2) * tEased * uVec.x + 3 * (1 - tEased) * Math.pow(tEased, 2) * vVec.x + Math.pow(tEased, 3) * v.x,
            y: Math.pow(1 - tEased, 3) * -u.y + 3 * Math.pow(1 - tEased, 2) * tEased * -uVec.y + 3 * (1 - tEased) * Math.pow(tEased, 2) * -vVec.y + Math.pow(tEased, 3) * -v.y
        };

        let newHue = ColorUtilities.hueLerp(uHue, vHue, tEased);
        let newSat = lerp(uSat, vSat, tEased);
        let newWeight = lerp(u.size / STROKE_DIVIDER, v.size / STROKE_DIVIDER, tEased);

        return {x: tV.x, y: tV.y, hue: newHue, sat: newSat, weight: newWeight, t: t};
    }
}

