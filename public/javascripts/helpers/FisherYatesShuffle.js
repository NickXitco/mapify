function shuffle(array) {
    let current = array.length;
    let temp = 0;
    let random = 0;
    Math.seedrandom();

    while (current !== 0) {
        random = Math.floor(Math.random() * current);
        current--;

        temp = array[current];
        array[current] = array[random];
        array[random] = temp;
    }

    return array;
}