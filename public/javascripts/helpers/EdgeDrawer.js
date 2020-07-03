const STROKE_DIVIDER = 5;
const EASE_SPEED = 10;
const MAX_EDGE_SEGMENTS = 128;
const ANGLE_THRESHOLD = 178;

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

        let numSegments = this.runEdgeDrawer(e, u, v, uVec, vVec, uHue, vHue, uSat, vSat);

        fill('white');
        noStroke();
        textSize(50);
        text(numSegments, v.x, -v.y);
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

        const u = points[0];
        const v = points[points.length - 1];



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
            stroke(color(ColorUtilities.hueLerp(u.hue, v.hue, i / points.length), lerp(u.sat, v.sat, i / points.length), 100));
            strokeWeight(lerp(u.weight, v.weight,  i / points.length));
        }

        for (const point of points) {
            stroke(color(point.hue, point.sat, 100));
            strokeWeight(point.weight);
            noFill();
            circle(point.x, point.y, point.weight * STROKE_DIVIDER);
            noStroke();
            fill('white');
            text(Math.round(point.angle ? point.angle : 0), point.x, point.y);
        }
    }

    static reduceEdgePoints(edgePoints) {
        let finalEdgePoints = [];

        let a = 0;
        let b = 1;
        let c = 2;

        finalEdgePoints.push(edgePoints[a]);
        if (edgePoints.length === 2) {
            finalEdgePoints.push(edgePoints[b]);
        }

        while (c < edgePoints.length) {
            let angle = this.getMiddleAngle(edgePoints, a, b, c);
            edgePoints[c].angle = angle;

            if (angle >= ANGLE_THRESHOLD) {
                //Don't push point B, move B and C along the line
                b = c;
                c++;
            } else {
                //Push point B, move A, B, and C along the line.
                finalEdgePoints.push(edgePoints[b]);
                a = b;
                b = c;
                c++;
            }
        }

        if (edgePoints.length > 2) {
            finalEdgePoints.push(edgePoints[edgePoints.length - 1]);
        }
        return finalEdgePoints;
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

