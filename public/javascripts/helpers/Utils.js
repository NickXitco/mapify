Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
}

const PLANE_RADIUS = 4457.086193532795 //DO NOT CHANGE UNLESS DATASET CHANGES

const FENCE_CLICK_RADIUS = 10;
const FENCE_CLICK_MIN_VIRTUAL_RADIUS = 1.75;

const PageStates = Object.freeze({
    //Sources/Destinations
    HOME: "HOME",
    ARTIST: "ARTIST",
    GENRE: "GENRE",
    GENRE_ARTIST: "GENRE_ARTIST",
    REGION: "REGION",
    REGION_ARTIST: "REGION_ARTIST",
    PATH: "PATH",

    //Sources
    UNKNOWN: "UNKNOWN",
    SP_DIALOG: "SP_DIALOG",
    RANDOM: "RANDOM",
    SEARCH: "SEARCH",
    INVALID: "INVALID",
});

const PageActions = Object.freeze({
    DEFAULT: "DEFAULT",
    ARTIST: "ARTIST",
    GENRE: "GENRE",
    MAP: "MAP",
    REGION: "REGION",
});

function parseUnknownSource() {
    const hash = window.location.hash;
    const attributes = [];

    let lastIndex = 0;
    while (true) {
        const i = hash.indexOf("=", lastIndex);
        if (i < 0) {
            break;
        }
        lastIndex = i + 1;
        attributes.push(hash[i - 1]);
    }

    if (attributes.includes("p")) {
        return PageStates.PATH;
    }

    if (attributes.includes("r") && attributes.includes("a")) {
        return PageStates.REGION_ARTIST;
    }

    if (attributes.includes("g") && attributes.includes("a")) {
        return PageStates.GENRE_ARTIST;
    }

    if (attributes.includes("r")) {
        return PageStates.REGION;
    }

    if (attributes.includes("g")) {
        return PageStates.GENRE;
    }

    if (attributes.includes("a")) {
        return PageStates.ARTIST;
    }

    return PageStates.HOME;
}

/**
 * Maps a source page and an action to a new page.
 * @param src PageState of source page
 * @param action PageAction of action taken on source
 * @return {number} PageState of destination
 */
function stateMapper(src, action) {
    // If we have an invalid url, redirect us home.
    if (src === PageStates.INVALID) {
        return PageStates.HOME;
    }

    // If we have a map click and we aren't currently in the two sub-artist pages, go home.
    if (action === PageActions.MAP && src !== PageStates.GENRE_ARTIST && src !== PageStates.REGION_ARTIST) {
        return PageStates.HOME
    }

    //Only one thing to do with the SP now
    if (src === PageStates.SP_DIALOG) {
        return PageStates.PATH;
    }

    if (action === PageStates.REGION) {
        return PageStates.REGION;
    }

    // Unless we're on the genre page or region page, any click on an artist should bring up the artist sidebar
    if (action === PageActions.ARTIST && src !== PageStates.GENRE && src !== PageStates.REGION) {
        return PageStates.ARTIST
    }

    // No matter where we are, clicking on a genre brings us to the genre sidebar
    if (action === PageActions.GENRE) {
        return PageStates.GENRE
    }

    //Now to fulfill the special cases
    // If we're on the genre page and we click an artist, we want to open the artist but with the genre highlighted
    if (action === PageActions.ARTIST && src === PageStates.GENRE) {
        return PageStates.GENRE_ARTIST;
    }

    // Similarly if we're on a region.
    if (action === PageActions.ARTIST && src === PageStates.REGION) {
        return PageStates.REGION_ARTIST;
    }

    // We need to redirect both back if you click on the map.
    if (action === PageActions.MAP && src === PageStates.GENRE_ARTIST) {
        return PageStates.GENRE
    }

    if (action === PageActions.MAP && src === PageStates.REGION_ARTIST) {
        return PageStates.REGION;
    }

    //By default, return home, it's the safest option.
    return PageStates.HOME;
}


const Utils = {
    copy: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    map: function(n, a, b, c, d) {
        return (n - a) / (b - a) * (d - c) + c;
    },

    dist: function(x1, y1, x2, y2) {
        return Math.hypot(x1 - x2, y1 - y2);
    },

    lerp: function(start, end, t) {
        return start + t * (end - start);
    },

    /***
     * Calculates the inverse of the gnomic projection of a plane onto a unit sphere
     * @param x x-coordinate of input point on plane
     * @param y y-coordinate of input point on plane
     * @param lambda0 - central longitude of projection
     * @param phi1 - central latitude of projection
     * @param r - max radius of plane
     * @return {{latitude: number, longitude: number}} Latitude and longitude in degrees
     */
    gnomicProjection: function(x, y, lambda0, phi1, r) {
        const X = x / r;
        const Y = y / r;
        const p = Math.hypot(X, Y);
        const c = Math.atan(p);

        const sinPhi1 = Math.sin(phi1);
        const cosPhi1 = Math.cos(phi1);
        const cosC = Math.cos(c);
        const sinC = Math.sin(c);

        let lat, long;

        if (p === 0) {
            lat = Math.asin(cosC * sinPhi1);
        } else {
            lat = Math.asin(cosC * sinPhi1 + ((Y * sinC * cosPhi1) / p));
        }

        long = lambda0 + Math.atan2(X * sinC, (p * cosPhi1 * cosC) - (Y * sinPhi1 * sinC));

        return {
            latitude: lat * (180 / Math.PI),
            longitude: long * (180 / Math.PI)
        }
    },

    formatNum: function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    nameShape: function (numPosts) {
        console.log("naming");
        const sides = numPosts - 1;
        switch (sides) {
            case 3: return "triangle"
            case 4: return "quadrilateral"
            case 5: return "pentagon"
            case 6: return "hexagon"
            case 7: return "heptagon"
            case 8: return "octagon"
            case 9: return "nonagon"
            case 69: return "niceagon"
            default:
                let s = "";
                if (sides > 99) return "region";
                const hundreds = Math.floor(sides / 100);
                const tens = Math.floor((sides - 100 * hundreds) / 10);
                const ones = Math.floor(sides - 100 * hundreds - 10 * tens);
                switch (hundreds) {
                    case 1: s += "hecta"; break;
                    case 2: s += "dihecta"; break;
                    case 3: s += "trihecta"; break;
                    case 4: s += "tetrahecta"; break;
                    case 5: s += "pentahecta"; break;
                    case 6: s += "hexahecta"; break;
                    case 7: s += "heptahecta"; break;
                    case 8: s += "octahecta"; break;
                    case 9: s += "enneahecta"; break;
                }
                switch (tens) {
                    case 1: s += "deca"; break;
                    case 2: s += "icosa"; break;
                    case 3: s += "triconta"; break;
                    case 4: s += "tetraconta"; break;
                    case 5: s += "pentaconta"; break;
                    case 6: s += "hexaconta"; break;
                    case 7: s += "heptaconta"; break;
                    case 8: s += "octaconta"; break;
                    case 9: s += "enneaconta"; break;
                }
                switch (ones) {
                    case 1: s += "hena"; break;
                    case 2: s += "di"; break;
                    case 3: s += "tri"; break;
                    case 4: s += "tetra"; break;
                    case 5: s += "penta"; break;
                    case 6: s += "hexa"; break;
                    case 7: s += "hepta"; break;
                    case 8: s += "octa"; break;
                    case 9: s += "ennea"; break;
                }
                s += "gon";
                return s
        }
    },

    regionToString: function (region) {
        let postCoordinates = [];
        for (const post of region) {
            postCoordinates.push(post.x);
            postCoordinates.push(post.y);
        }

        const coordinateString = postCoordinates.join(",");
        const THRESHOLD = 1000;
        return coordinateString.length > 1000 ?
               coordinateString.substring(0, THRESHOLD - 3) + "..." :
               coordinateString.substring(0, THRESHOLD);
    },

    /**
     * https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon/17490923#17490923
     * @param point
     * @param polygon[]
     */
    pointInPolygon: function (point, polygon) {
        let isInside = false;
        let minX = polygon[0].x, maxX = polygon[0].x;
        let minY = polygon[0].y, maxY = polygon[0].y;
        for (let n = 1; n < polygon.length; n++) {
            const q = polygon[n];
            minX = Math.min(q.x, minX);
            maxX = Math.max(q.x, maxX);
            minY = Math.min(q.y, minY);
            maxY = Math.max(q.y, maxY);
        }

        if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
            return false;
        }

        let i = 0, j = polygon.length - 1;
        for (i, j; i < polygon.length; j = i++) {
            if ( (polygon[i].y > point.y) !== (polygon[j].y > point.y) &&
                point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x ) {
                isInside = !isInside;
            }
        }

        return isInside;
    },

    fenceComplete: function (fence) {
        const end = fence.length - 1;
        return fence.length > 2 && fence[0].x === fence[end].x && fence[0].y === fence[end].y;
    }
}