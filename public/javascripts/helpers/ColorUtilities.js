const ColorUtilities = {
    hueLerp: function(p, start, end, x) {
        let dir;
        p.colorMode(p.HSB);
        if (end > start) {
            if (start >= 145) {
                dir = 1;
            } else if (end - start > (360 + start) - end) {
                dir = -1;
            } else {
                dir = 1;
            }
        } else {
            if (end >= 145) {
                dir = -1;
            } else if (start - end > (360 + end) - start) {
                dir = 1;
            } else {
                dir = -1;
            }
        }



        if (dir === 1) {
            return (start + (x * ((end - start).mod(360) * dir))).mod(360);
        } else {
            return (start + (x * ((start - end).mod(360) * dir))).mod(360);
        }
    },

    rgb2hsv: function(r, g, b) {
        let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
        rabs = r / 255;
        gabs = g / 255;
        babs = b / 255;
        v = Math.max(rabs, gabs, babs);
        diff = v - Math.min(rabs, gabs, babs);
        diffc = c => (v - c) / 6 / diff + 1 / 2;
        percentRoundFn = num => Math.round(num * 100) / 100;
        if (diff === 0) {
            h = s = 0;
        } else {
            s = diff / v;
            rr = diffc(rabs);
            gg = diffc(gabs);
            bb = diffc(babs);

            if (rabs === v) {
                h = bb - gg;
            } else if (gabs === v) {
                h = (1 / 3) + rr - bb;
            } else if (babs === v) {
                h = (2 / 3) + gg - rr;
            }
            if (h < 0) {
                h += 1;
            }else if (h > 1) {
                h -= 1;
            }
        }
        return {
            h: Math.round(h * 360),
            s: percentRoundFn(s * 100),
            v: percentRoundFn(v * 100)
        };
    }
}