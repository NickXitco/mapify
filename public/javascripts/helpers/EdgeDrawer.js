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
    static drawEdge(camera, e) {
        //Create shorthand variables to represent the edges two endpoints.
        const u = e.u;
        const v = e.v;

        //Create p5 vectors for control point manipulation
        const cU = {x: u.x, y: u.y};
        const cV = {x: v.x, y: v.y};

        //Push the control points towards the other endpoint
        const cUxLerp = Utils.lerp(cU.x, cV.x, e.cURad);
        const cUyLerp = Utils.lerp(cU.y, cV.y, e.cURad);
        const cVxLerp = Utils.lerp(cV.x, cU.x, e.cVRad);
        const cVyLerp = Utils.lerp(cV.y, cU.y, e.cVRad);
        cU.x = cUxLerp
        cU.y = cUyLerp
        cV.x = cVxLerp
        cV.y = cVyLerp

        //Rotate the control points by transforming to the origin and back again
        cU.x -= u.x;
        cU.y -= u.y;

        cV.x -= v.x;
        cV.y -= v.y;

        const cUxRotate = Math.cos(e.cUAng * (Math.PI/180)) * cU.x - Math.sin(e.cUAng * (Math.PI/180)) * cU.y;
        const cUyRotate = Math.sin(e.cUAng * (Math.PI/180)) * cU.x + Math.cos(e.cUAng * (Math.PI/180)) * cU.y;
        cU.x = cUxRotate
        cU.y = cUyRotate

        const cVxRotate = Math.cos(e.cVAng * (Math.PI/180)) * cV.x - Math.sin(e.cVAng * (Math.PI/180)) * cV.y;
        const cVyRotate = Math.sin(e.cVAng * (Math.PI/180)) * cV.x + Math.cos(e.cVAng * (Math.PI/180)) * cV.y;
        cV.x = cVxRotate
        cV.y = cVyRotate

        cU.x += u.x;
        cU.y += u.y;

        cV.x += v.x;
        cV.y += v.y;

        //Convert the rgb colors of the endpoints to HSV values
        let uHSV = ColorUtilities.rgb2hsv(u.r, u.g, u.b);
        let vHSV = ColorUtilities.rgb2hsv(v.r, v.g, v.b);

        let uHue = uHSV.h;
        let vHue = vHSV.h;
        let uSat = uHSV.s;
        let vSat = vHSV.s;

        //If we don't have edge points, get them!
        if (e.points.length === 0) {
            e.points = this.flatten(this.getEdgePoints(1, u, v, cU, cV, uHue, vHue, uSat, vSat));
        }

        let points = [];
        points.push(e.points[0]);
        for (let i = 1; i < e.points.length; i++) {
            if (e.points[i].t <= e.tMax) {
                points.push(e.points[i]);
            }
        }

        //Get the last point on the line. This is important as we increment e.tMax with every frame, but we only
        //complete a full segment every few frames, so this ensures that the line is being drawn smoothly and not
        //in chunks.
        const leadPoint = this.getPoint(e.tMax, u, v, cU, cV, uHue, vHue, uSat, vSat);

        let segments = [];
        for (let i = 0; i < points.length - 1; i++) {
            segments.push({u: points[i], v: points[i + 1]});
        }

        e.graphicsHead.visible = true;
        e.graphicsTail.visible = true;
        if (segments.length > e.segmentsDrawn) {
            //New line segments have appeared, we must draw them!
            this.drawSegments(e.graphicsTail, camera, segments, e.segmentsDrawn);
            //Clear color array https://www.html5gamedevs.com/topic/47284-bizarre-linestyle-behavior/
            e.graphicsTail._geometry.colors = [];
            e.segmentsDrawn += segments.length - e.segmentsDrawn;
        }

        e.graphicsHead.clear();
        if (e.tMax !== 1 && segments.length > 1) {
            // we are animating
            const animationSegments = [];
            animationSegments.push({
                u: points[points.length - 1],
                v: leadPoint
            });
            this.drawSegments(e.graphicsHead, camera, animationSegments, 0);
        }

        //Increment tMax up to a max value of 1
        const fpsMultiplier = (60 / canvasFPS);
        e.tMax = Math.min(1, e.tMax + ((EASE_SPEED * fpsMultiplier) / Utils.dist(u.x, u.y, v.x, v.y)));
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
     * @param graphics{PIXI.Graphics} PIXI graphics object
     * @param camera{Camera} Canvas' camera object
     * @param segments{[]} Array of segments
     * @param startIndex{number}
     */
    static drawSegments(graphics, camera, segments, startIndex) {
        for (let i = startIndex; i < segments.length; i++) {
            const segment = segments[i];
            //Prevents edges from appearing too thin.
            //Increasing threshold will make small lines larger, vice versa.
            const THRESHOLD = 0.5;
            const strokeWeight = Math.max(segment.u.weight, THRESHOLD / camera.getZoomFactor().x);
            const color = ColorUtilities.hsv2rgb(segment.u.hue, segment.u.sat, 100);
            const hexColor = ColorUtilities.rgb2hex(color.r, color.g, color.b);

            graphics.lineStyle({
                width: strokeWeight,
                color: hexColor,
                cap: PIXI.LINE_CAP.ROUND,
            });
            graphics.moveTo(segment.u.x, segment.u.y);
            graphics.lineTo(segment.v.x, segment.v.y);
        }
    }

    /**
     * Flatten a list of edge points by removing superfluous points
     * @param edgePoints{[]} An array of edge points
     * @return {[]} An array of edge points that has been minimized to remove superfluous points
     */
    static flatten(edgePoints) {
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
            let angle = this.getMiddleAngle(edgePoints, a, b, c);
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
    static getEdgePoints(tMax, u, v, cU, cV, uHue, vHue, uSat, vSat) {
        let edgePoints = [];
        edgePoints.push({x: u.x, y: -u.y, hue: uHue, sat: uSat, weight: u.size / STROKE_DIVIDER, t: 0});

        let t = 0;
        while (t < tMax) {
            t = Math.min(tMax, t + (1 / MAX_EDGE_SEGMENTS));
            edgePoints.push(this.getPoint(t, u, v, cU, cV, uHue, vHue, uSat, vSat));
        }
        return edgePoints;
    }

    /**
     * Get angle between three points a, b, c.
     * @param edgePoints Array of edge points on curve
     * @param a Index of point a
     * @param b Index of point b
     * @param c Index of point c
     * @return Number Angle abc in degrees
     */
    static getMiddleAngle(edgePoints, a, b, c) {
        let dAB = Utils.dist(edgePoints[a].x, edgePoints[a].y, edgePoints[b].x, edgePoints[b].y);
        let dBC = Utils.dist(edgePoints[b].x, edgePoints[b].y, edgePoints[c].x, edgePoints[c].y);
        let dAC = Utils.dist(edgePoints[a].x, edgePoints[a].y, edgePoints[c].x, edgePoints[c].y);
        return Math.acos((dAB * dAB + dBC * dBC - dAC * dAC) / (2 * dAB * dBC)) * (180 / Math.PI);
    }

    /**
     * Get a point on the bezier curve at parameter t.
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
    static getPoint(t, u, v, cU, cV, uHue, vHue, uSat, vSat) {
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

        let newHue = ColorUtilities.hueLerp(uHue, vHue, tEased);
        let newSat = Utils.lerp(uSat, vSat, tEased);
        let newWeight = Utils.lerp(u.size / STROKE_DIVIDER, v.size / STROKE_DIVIDER, tEased);

        return {x: tV.x, y: tV.y, hue: newHue, sat: newSat, weight: newWeight, t: t};
    }
}

