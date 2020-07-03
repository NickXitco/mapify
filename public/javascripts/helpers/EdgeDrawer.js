const STROKE_DIVIDER = 5;
const EASE_SPEED = 25;
const EDGE_SEGMENTS = 50;

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

        stroke(u.color);

        stroke('white');
        beginShape();
        vertex(u.x, -u.y);


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

        let t = 0;
        let brokeEarly = false;
        let numSegments = 0;


        while (t < e.tMax) {
            t += 1 / EDGE_SEGMENTS;
            const tEased = Eases.easeOutQuad(t);

            let tV = {x: Math.pow(1 - tEased, 3) *  u.x + 3 * Math.pow(1 - tEased, 2) * tEased *  uVec.x + 3 * (1 - tEased) * Math.pow(tEased, 2) *  vVec.x + Math.pow(tEased, 3) *  v.x,
                      y: Math.pow(1 - tEased, 3) * -u.y + 3 * Math.pow(1 - tEased, 2) * tEased * -uVec.y + 3 * (1 - tEased) * Math.pow(tEased, 2) * -vVec.y + Math.pow(tEased, 3) * -v.y};

            let newHue = ColorUtilities.hueLerp(uHue, vHue, tEased, dir);
            stroke(color(newHue, lerp(uSat, vSat, tEased), 100));
            strokeWeight(lerp(u.size / STROKE_DIVIDER, v.size / STROKE_DIVIDER, tEased));

            if (!camera.containsPoint(tV.x, -tV.y)) {
                brokeEarly = true;
                vertex(tV.x, tV.y);
                endShape();
                break;
            }

            if (needsSegmentBreak(tV)) {
                vertex(tV.x, tV.y);
                endShape();
                beginShape();
                vertex(tV.x, tV.y);
                numSegments++;
            }
        }

        if (e.tMax === 1 && !brokeEarly) {
            vertex(v.x, -v.y);
        }
        endShape();
        fill('white');
        noStroke();
        textSize(50);
        text(numSegments, v.x, -v.y);
        pop();

        e.tMax = Math.min(1, e.tMax + (EASE_SPEED / dist(u.x, u.y, v.x, v.y)));


    }
}

function needsSegmentBreak(tV) {
    return true;
}