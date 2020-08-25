const STROKE_DIVIDER = 5;
const EASE_SPEED = 25;
const MAX_EDGE_SEGMENTS = 512;
const ANGLE_THRESHOLD = 179;
const HUE_THRESHOLD = 4;
const SAT_THRESHOLD = 2;
const WEIGHT_THRESHOLD = 1.025;


class EdgeDrawer {
    static drawEdge(p, camera, e) {
        const u = e.u;
        const v = e.v;

        const uVec = p.createVector(u.x, u.y);
        const vVec = p.createVector(v.x, v.y);

        p.push();
        uVec.lerp(vVec, e.cURad);
        vVec.lerp(uVec, e.cVRad);
        uVec.sub(u.x, u.y);
        vVec.sub(v.x, v.y);
        uVec.rotate(e.cUAng);
        vVec.rotate(e.cVAng);
        uVec.add(u.x, u.y);
        vVec.add(v.x, v.y);

        let uHSV = ColorUtilities.rgb2hsv(u.r, u.g, u.b);
        let vHSV = ColorUtilities.rgb2hsv(v.r, v.g, v.b);

        let uHue = uHSV.h;
        let vHue = vHSV.h;
        let uSat = uHSV.s;
        let vSat = vHSV.s;

        p.noFill();
        if (e.points.length === 0) {
            e.points = this.flatten(p, this.getEdgePoints(p, u, uHue, uSat, 1, v, uVec, vVec, vHue, vSat));
        }

        p.colorMode(p.HSB);
        this.drawEdgePoints(p, camera, e.points);

        /*
        for (const point of e.points) {
            p.stroke(p.color(point.hue, point.sat, 100));
            p.strokeWeight(point.weight);
            p.circle(point.x, point.y, 10);
        }

         */

        p.pop();

        e.tMax = Math.min(1, e.tMax + (EASE_SPEED / Utils.dist(u.x, u.y, v.x, v.y)));
    }

    static drawEdgePoints(p, camera, points) {
        p.textSize(15);

        for (let i = 0; i < points.length; i++) {
            if (i === 0) {
                p.beginShape();
                p.vertex(points[i].x, points[i].y);
            } else if (i === points.length - 1) {
                p.vertex(points[i].x, points[i].y);
                p.endShape();
            } else {
                p.vertex(points[i].x, points[i].y);
                p.endShape();
                p.beginShape();
                p.vertex(points[i].x, points[i].y);
            }
            p.stroke(p.color(points[i].hue, points[i].sat, 100));

            //Prevents edges from appearing too thin. Increasing threshold will make small lines larger, vice versa.
            const THRESHOLD = 0.5;
            p.strokeWeight(Math.max(points[i].weight, THRESHOLD / camera.getZoomFactor().x));
        }
    }

    static removeOutOfView(camera, edgePoints) {
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

    static flatten(p, edgePoints) {
        let flattened = [];

        let a = 0;
        let b = 1;
        let c = 2;

        flattened.push(edgePoints[a]);
        if (edgePoints.length === 2) {
            flattened.push(edgePoints[b]);
        }

        while (c < edgePoints.length) {
            let angle = this.getMiddleAngle(p, edgePoints, a, b, c);
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

    static getEdgePoints(p, u, uHue, uSat, tMax, v, uVec, vVec, vHue, vSat) {
        let edgePoints = [];
        edgePoints.push({x: u.x, y: -u.y, hue: uHue, sat: uSat, weight: u.size / STROKE_DIVIDER});

        let t = 0;
        while (t < tMax) {
            t = Math.min(tMax, t + (1 / MAX_EDGE_SEGMENTS));
            edgePoints.push(this.getPoint(p, t, u, v, uVec, vVec, uHue, vHue, uSat, vSat));
        }
        return edgePoints;
    }

    static getMiddleAngle(p, edgePoints, a, b, c) {
        let dAB = Utils.dist(edgePoints[a].x, edgePoints[a].y, edgePoints[b].x, edgePoints[b].y);
        let dBC = Utils.dist(edgePoints[b].x, edgePoints[b].y, edgePoints[c].x, edgePoints[c].y);
        let dAC = Utils.dist(edgePoints[a].x, edgePoints[a].y, edgePoints[c].x, edgePoints[c].y);
        return p.degrees(Math.acos((dAB * dAB + dBC * dBC - dAC * dAC) / (2 * dAB * dBC)));
    }

    static getPoint(p, t, u, v, uVec, vVec, uHue, vHue, uSat, vSat) {
        const tEased = Eases.easeOutQuad(t);

        let tV = {
            x: Math.pow(1 - tEased, 3) * u.x + 3 * Math.pow(1 - tEased, 2) * tEased * uVec.x + 3 * (1 - tEased) * Math.pow(tEased, 2) * vVec.x + Math.pow(tEased, 3) * v.x,
            y: Math.pow(1 - tEased, 3) * -u.y + 3 * Math.pow(1 - tEased, 2) * tEased * -uVec.y + 3 * (1 - tEased) * Math.pow(tEased, 2) * -vVec.y + Math.pow(tEased, 3) * -v.y
        };

        let newHue = ColorUtilities.hueLerp(p, uHue, vHue, tEased);
        let newSat = p.lerp(uSat, vSat, tEased);
        let newWeight = p.lerp(u.size / STROKE_DIVIDER, v.size / STROKE_DIVIDER, tEased);

        return {x: tV.x, y: tV.y, hue: newHue, sat: newSat, weight: newWeight, t: t};
    }
}

