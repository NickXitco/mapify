class Vertex {
    x;
    y;

    size;
    color;

    quad;

    visible;

    text;

    glowPacity;

    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.text = Math.random().toString(36).substring(7);

        this.glowPacity = 0;
    }
}
