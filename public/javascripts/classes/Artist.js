class Artist {
    name;
    id;

    followers;
    popularity;

    x;
    y;
    size;

    r;
    g;
    b;

    genres;

    relatedIDs;
    relatedVertices;

    quad;

    loaded;

    edges;

    constructor(doc) {
        this.name = doc.name;
        this.id = doc.id;

        this.followers = doc.followers;
        this.popularity = doc.popularity;

        this.x = doc.x;
        this.y = doc.y;

        this.size = doc.size;

        this.r = doc.r;
        this.g = doc.g;
        this.b = doc.b;

        this.genres = doc.genres;
        this.relatedIDs = doc.relatedIDs;

        this.relatedVertices = new Set();
        this.quad = null;
        this.loaded = false;

        this.edges = [];
    }

    colorToString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`
    }

    colorOpacityToString(opacity) {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${opacity})`
    }
}