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
        switch (numPosts - 1) {
            case 3: return "triangle"
            case 4: return "quadrilateral"
            case 5: return "pentagon"
            case 6: return "hexagon"
            case 7: return "heptagon"
            case 8: return "octagon"
            case 9: return "nonagon"
            case 10: return "decagon"
            case 11: return "hendecagon"
            case 12: return "dodecagon"
            case 13: return "tridecagon"
            case 14: return "tetradecagon"
            case 15: return "pentadecagon"
            case 16: return "hexadecagon"
            case 17: return "heptadecagon"
            case 18: return "octadecagon"
            case 19: return "enneadecagon"
            case 20: return "icosagon"
            case 21: return "icosihenagon"
            case 22: return "icosidigon"
            case 23: return "icositrigon"
            case 24: return "icositetragon"
            case 25: return "icosipentagon"
            case 26: return "icosihexagon"
            case 69: return "niceagon"
            default: return "region"
        }
    }

}