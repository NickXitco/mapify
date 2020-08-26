const STROKE_DIVIDER = 5;
const EASE_SPEED = 15;
const MAX_EDGE_SEGMENTS = 1024;
const ANGLE_THRESHOLD = 179;
const HUE_THRESHOLD = 4;
const SAT_THRESHOLD = 2;
const DISTANCE_THRESHOLD = 25;
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

        let points = [];

        points.push(e.points[0]);
        for (let i = 1; i < e.points.length; i++) {
            if (e.points[i].t < e.tMax) {
                points.push(e.points[i]);
            }
        }
        points.push(this.getPoint(p, e.tMax, u, v, uVec, vVec, uHue, vHue, uSat, vSat));

        let segments = [];
        for (let i = 0; i < points.length - 1; i++) {
            segments.push({u: points[i], v: points[i + 1]});
        }

        let boundedSegments = [];
        let uBoundarySegment = null;
        let vBoundarySegment = null;
        let vBoundary = false;
        for (const segment of segments) {
            const uUDist = Utils.dist(segment.u.x, segment.u.y, u.x, -u.y);
            const uVDist = Utils.dist(segment.v.x, segment.v.y, u.x, -u.y);
            const vDist = Utils.dist(segment.v.x, segment.v.y, v.x, -v.y);

            if (uUDist > u.size * 0.6 && vDist > v.size * 0.6) {
                if (boundedSegments.length === 0) {
                    boundedSegments.push(JSON.parse(JSON.stringify(uBoundarySegment)));
                }
                boundedSegments.push(segment);
            } else if (boundedSegments.length === 0) {
                uBoundarySegment = segment;

                //This line is super jank so I'll try to explain it while it's still in my head.
                //In this current setup, if the last line of the segment has one endpoint in the circle and one endpoint
                //out of the circle, it will not be drawn, since it will fail the first condition, and since there are no
                //more segments to go through, it just doesn't draw a line.

                //But we DO want to draw the line and then adjust the u-side endpoint

                //TODO figure out a better way of doing this
                if (segment === segments[segments.length - 1] && uVDist > u.size * 0.6) {
                    boundedSegments.push(JSON.parse(JSON.stringify(uBoundarySegment)));
                }
            } else {
                vBoundarySegment = segment;
                boundedSegments.push(JSON.parse(JSON.stringify(vBoundarySegment)));
                vBoundary = true;
                break;
            }
        }

        if (boundedSegments.length > 0) {
            let uDPrime = u.size * 0.6 - Utils.dist(boundedSegments[0].u.x, boundedSegments[0].u.y, u.x, -u.y);
            let vDPrime = v.size * 0.6 - Utils.dist(boundedSegments[boundedSegments.length - 1].v.x, boundedSegments[boundedSegments.length - 1].v.y, v.x, -v.y);
            let uD = Utils.dist(boundedSegments[0].u.x, boundedSegments[0].u.y, boundedSegments[0].v.x, boundedSegments[0].v.y);
            let vD = Utils.dist(boundedSegments[boundedSegments.length - 1].u.x, boundedSegments[boundedSegments.length - 1].u.y, boundedSegments[boundedSegments.length - 1].v.x, boundedSegments[boundedSegments.length - 1].v.y);
            let uT = uDPrime / uD;
            let vT = vDPrime / vD;

            let uXPrime = (1 - uT) * boundedSegments[0].u.x + (uT) * boundedSegments[0].v.x;
            let uYPrime = (1 - uT) * boundedSegments[0].u.y + (uT) * boundedSegments[0].v.y;
            let vXPrime = (1 - vT) * boundedSegments[boundedSegments.length - 1].v.x + (vT) * boundedSegments[boundedSegments.length - 1].u.x;
            let vYPrime = (1 - vT) * boundedSegments[boundedSegments.length - 1].v.y + (vT) * boundedSegments[boundedSegments.length - 1].u.y;

            boundedSegments[0].u.x = uXPrime;
            boundedSegments[0].u.y = uYPrime;

            if (vBoundary) {
                boundedSegments[boundedSegments.length - 1].v.x = vXPrime;
                boundedSegments[boundedSegments.length - 1].v.y = vYPrime;
            }
        }

        let segmentsInCamera = [];
        for (const segment of boundedSegments) {
            const bbox = {
                x: (segment.u.x + segment.v.x) / 2,
                y: (segment.u.y + segment.v.y) / 2,
                r: Math.max(Math.abs(segment.u.x - segment.v.x), Math.abs(segment.u.y - segment.v.y)) + segment.u.weight
            }

            if (camera.containsRegion(bbox.x, -bbox.y, bbox.r) ||
                camera.containsPoint(segment.u.x, segment.u.y) ||
                camera.containsPoint(segment.v.x, segment.v.y)){
                segmentsInCamera.push(segment);
            }
        }

        this.drawSegments(p, camera, segmentsInCamera);

        p.pop();

        e.tMax = Math.min(1, e.tMax + (EASE_SPEED / Utils.dist(u.x, u.y, v.x, v.y)));
    }

    static drawSegments(p, camera, segments) {
        for (const segment of segments) {
            p.stroke(p.color(segment.u.hue, segment.u.sat, 100));

            //Prevents edges from appearing too thin. Increasing threshold will make small lines larger, vice versa.
            const THRESHOLD = 0.5;
            p.strokeWeight(Math.max(segment.u.weight, THRESHOLD / camera.getZoomFactor().x));

            p.line(segment.u.x, segment.u.y, segment.v.x, segment.v.y);
        }
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
            let distance = Utils.dist(edgePoints[a].x, edgePoints[a].y, edgePoints[c].x, edgePoints[c].y);

            edgePoints[c].angle = angle;

            if (angle < ANGLE_THRESHOLD || hueDif > HUE_THRESHOLD || satDif > SAT_THRESHOLD || weightRatio > WEIGHT_THRESHOLD || distance > DISTANCE_THRESHOLD) {
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
        edgePoints.push({x: u.x, y: -u.y, hue: uHue, sat: uSat, weight: u.size / STROKE_DIVIDER, t: 0});

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

