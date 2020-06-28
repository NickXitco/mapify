class Artist {
    name;
    id;

    followers;
    popularity;

    x;
    y;
    size;

    color;

    genres;

    relatedIDs;
    relatedVertices;

    quad;

    loaded;

    constructor(doc) {
        this.name = doc.name;
        this.id = doc.id;
        this.followers = doc.followers;
        this.popularity = doc.popularity;
        this.x = doc.x;
        this.y = doc.y;
        this.size = doc.size;
        this.color = color(doc.r, doc.g, doc.b);
        this.genres = doc.genres;
        this.relatedIDs = doc.relatedIDs;

        this.relatedVertices = new Set();
        this.quad = null;
        this.loaded = false;
    }
}