const STROKE_DIVIDER = 5;
const EASE_SPEED = 15;
const MAX_EDGE_SEGMENTS = 1024;
const ANGLE_THRESHOLD = 179;
const HUE_THRESHOLD = 4;
const SAT_THRESHOLD = 2;
const DISTANCE_THRESHOLD = 25;
const WEIGHT_THRESHOLD = 1.025;


class EdgeDrawer {
    /**
     * Main function for drawing edges on the graph.
     * @param p{p5} The p5 canvas object to draw on.
     * @param camera{Camera} The camera object of the canvas.
     * @param e An object containing the following fields:
     *          u, v (Artist objects representing endpoints),
     *          cURad and cVRad (0 - 0.5 floats representing how far along the the line between
     *                           u and v are the control points for the bezier curve. cURad = 0.25 would
     *                           mean the control point closer to u is 25% of the distance from u to v
     *                           away from u. The angle is decided by the next parameters)
     *          cUAng and cVAng (-90 - 90 floats representing the angle for which to rotate the
     *                           control points for u and v respectively. This angle is relative to the
     *                           axis created by the line between u and v.)
     *          tMax (0 - 1 float determining how much of the line should be drawn)
     *          points (An array of points in the curve, to be populated with points)
     */
    static drawEdge(p, camera, e) {
        //Create shorthand variables to represent the edges two endpoints.
        const u = e.u;
        const v = e.v;

        //Create p5 vectors for control point manipulation
        const cU = p.createVector(u.x, u.y);
        const cV = p.createVector(v.x, v.y);

        p.push();
        //Push the control points towards the other endpoint
        cU.lerp(cV, e.cURad);
        cV.lerp(cU, e.cVRad);
        //Rotate the control points by transforming to the origin and back again
        cU.sub(u.x, u.y);
        cV.sub(v.x, v.y);
        cU.rotate(e.cUAng);
        cV.rotate(e.cVAng);
        cU.add(u.x, u.y);
        cV.add(v.x, v.y);

        //Convert the rgb colors of the endpoints to HSV values
        let uHSV = ColorUtilities.rgb2hsv(u.r, u.g, u.b);
        let vHSV = ColorUtilities.rgb2hsv(v.r, v.g, v.b);

        let uHue = uHSV.h;
        let vHue = vHSV.h;
        let uSat = uHSV.s;
        let vSat = vHSV.s;

        p.noFill();

        //If we don't have edge points, get them!
        if (e.points.length === 0) {
            e.points = this.flatten(p, this.getEdgePoints(p, 1, u, v, cU, cV, uHue, vHue, uSat, vSat));
        }

        p.colorMode(p.HSB);

        let points = [];
        points.push(e.points[0]);
        for (let i = 1; i < e.points.length; i++) {
            if (e.points[i].t < e.tMax) {
                points.push(e.points[i]);
            }
        }

        //Get the last point on the line. This is important as we increment e.tMax with every frame, but we only
        //complete a full segment every few frames, so this ensures that the line is being drawn smoothly and not
        //in chunks.
        points.push(this.getPoint(p, e.tMax, u, v, cU, cV, uHue, vHue, uSat, vSat));

        let segments = [];
        for (let i = 0; i < points.length - 1; i++) {
            segments.push({u: points[i], v: points[i + 1]});
        }

        let segmentsInCamera = this.getSegmentsInCamera(segments, camera);

        this.drawSegments(p, camera, segmentsInCamera);

        p.pop();

        //Increment tMax up to a max value of 1
        e.tMax = Math.min(1, e.tMax + (EASE_SPEED / Utils.dist(u.x, u.y, v.x, v.y)));
    }

    /**
     * Gets all line segments in the camera view
     * @param segments List of edge segments
     * @param camera Camera object for the canvas
     * @return {[]} List of edge segments in the camera's view
     */
    static getSegmentsInCamera(segments, camera) {
        let segmentsInCamera = [];
        for (const segment of segments) {
            const bbox = {
                x: (segment.u.x + segment.v.x) / 2,
                y: (segment.u.y + segment.v.y) / 2,
                r: Math.max(Math.abs(segment.u.x - segment.v.x), Math.abs(segment.u.y - segment.v.y)) + segment.u.weight
            }

            if (camera.containsRegion(bbox.x, -bbox.y, bbox.r) ||
                camera.containsPoint(segment.u.x, segment.u.y) ||
                camera.containsPoint(segment.v.x, segment.v.y)) {
                segmentsInCamera.push(segment);
            }
        }
        return segmentsInCamera;
    }

    /**
     * Draws a list of edge segments to the canvas
     * @param p p5 canvas
     * @param camera{Camera} Canvas' camera object
     * @param segments{[]} Array of segments
     */
    static drawSegments(p, camera, segments) {
        for (const segment of segments) {
            p.stroke(p.color(segment.u.hue, segment.u.sat, 100));

            //Prevents edges from appearing too thin. Increasing threshold will make small lines larger, vice versa.
            const THRESHOLD = 0.5;
            p.strokeWeight(Math.max(segment.u.weight, THRESHOLD / camera.getZoomFactor().x));

            p.line(segment.u.x, segment.u.y, segment.v.x, segment.v.y);
        }
    }

    /**
     * Flatten a list of edge points by removing superfluous points
     * @param p p5 canvas object
     * @param edgePoints{[]} An array of edge points
     * @return {[]} An array of edge points that has been minimized to remove superfluous points
     */
    static flatten(p, edgePoints) {
        let flattened = [];

        //Initialize a, b, and c to the first 3 points of the line
        let a = 0;
        let b = 1;
        let c = 2;

        flattened.push(edgePoints[a]);
        if (edgePoints.length === 2) {
            flattened.push(edgePoints[b]);
        }

        /*
            This loop basically iterates over the line, taking triplets of vertices and checking if the middle
            vertex is necessary in order for the curve to be aesthetically pleasing. If so, we keep it, if not,
            we delete it, or rather, don't add it.
         */
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

    /**
     * Get the "circular difference" of 2 hues
     * @param a A hue value in degrees
     * @param b A hue value in degrees
     * @return {number}
     */
    static getHueDif(a, b) {
        return Math.min((a - b).mod(360), (b - a).mod(360));
    }

    /**
     * Get all edge points on the curve between u and v
     * @param p p5 canvas object
     * @param tMax Max value of t that we're making edges up to
     * @param u{Artist} Artist object for endpoint u
     * @param v{Artist} Artist object for endpoint v
     * @param cU p5 vector representing position of control point cU
     * @param cV p5 vector representing position of control point cV
     * @param uHue hue of endpoint u
     * @param vHue hue of endpoint v
     * @param uSat saturation of endpoint u
     * @param vSat saturation of endpoint v
     * @return An array of edge points on the curve
     */
    static getEdgePoints(p, tMax, u, v, cU, cV, uHue, vHue, uSat, vSat) {
        let edgePoints = [];
        edgePoints.push({x: u.x, y: -u.y, hue: uHue, sat: uSat, weight: u.size / STROKE_DIVIDER, t: 0});

        let t = 0;
        while (t < tMax) {
            t = Math.min(tMax, t + (1 / MAX_EDGE_SEGMENTS));
            edgePoints.push(this.getPoint(p, t, u, v, cU, cV, uHue, vHue, uSat, vSat));
        }
        return edgePoints;
    }

    /**
     * Get angle between three points a, b, c.
     * @param p p5 canvas object to do degree calculation
     * @param edgePoints Array of edge points on curve
     * @param a Index of point a
     * @param b Index of point b
     * @param c Index of point c
     * @return Number Angle abc in degrees
     */
    static getMiddleAngle(p, edgePoints, a, b, c) {
        let dAB = Utils.dist(edgePoints[a].x, edgePoints[a].y, edgePoints[b].x, edgePoints[b].y);
        let dBC = Utils.dist(edgePoints[b].x, edgePoints[b].y, edgePoints[c].x, edgePoints[c].y);
        let dAC = Utils.dist(edgePoints[a].x, edgePoints[a].y, edgePoints[c].x, edgePoints[c].y);
        return p.degrees(Math.acos((dAB * dAB + dBC * dBC - dAC * dAC) / (2 * dAB * dBC)));
    }

    /**
     * Get a point on the bezier curve at parameter t.
     * @param p{p5} p5 canvas object for lerps
     * @param t{Number} 0-1 float representing how far we are into the curve
     * @param u{Artist} Artist object for endpoint u
     * @param v{Artist} Artist object for endpoint v
     * @param cU p5 vector representing position of control point cU
     * @param cV p5 vector representing position of control point cV
     * @param uHue hue of endpoint u
     * @param vHue hue of endpoint v
     * @param uSat saturation of endpoint u
     * @param vSat saturation of endpoint v
     * @return {{t, sat, x, y, hue, weight}} Object containing properties of point on the curve at t.
     */
    static getPoint(p, t, u, v, cU, cV, uHue, vHue, uSat, vSat) {
        const tEased = Eases.easeOutQuad(t);

        function getBezierCoordinate(t, u, cU, cV, v) {
            return (
                Math.pow(1 - t, 3) * u +
                3 * Math.pow(1 - t, 2) * t * cU +
                3 * (1 - t) * Math.pow(t, 2) * cV +
                Math.pow(t, 3) * v
            );
        }

        let tV = {
            x: getBezierCoordinate(tEased, u.x, cU.x, cV.x, v.x),
            y: getBezierCoordinate(tEased, -u.y, -cU.y, -cV.y, -v.y)
        };

        let newHue = ColorUtilities.hueLerp(p, uHue, vHue, tEased);
        let newSat = p.lerp(uSat, vSat, tEased);
        let newWeight = p.lerp(u.size / STROKE_DIVIDER, v.size / STROKE_DIVIDER, tEased);

        return {x: tV.x, y: tV.y, hue: newHue, sat: newSat, weight: newWeight, t: t};
    }
}

