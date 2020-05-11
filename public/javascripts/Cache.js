/**
 * LRU Cache using object map and linked list.
 *
 * Linked list proceeds
 *_______ next     next   ________
 *      | ---> ... --->  |       |
 * HEAD |                | TAIL |
 *      | <--- ... <--- |       |
 * -----  prev     prev --------
 */
class Cache {
    capacity;
    headItem;
    tailItem;
    map;
    currentSize;

    constructor(capacity) {
        this.capacity = capacity;
        this.headItem = null;
        this.tailItem = null;
        this.currentSize = 0;
        this.map = {};
    }

    changeCapacity(newCapacity) {
        this.capacity = newCapacity;
        for (let i = this.currentSize; i > this.capacity; i--) {
            this.evict();
        }
    }

    insert(item, id) {
        const cacheItem = new CacheItem(item, id);
        if (!this.has(id)) {
            if (this.currentSize === this.capacity) {
                this.evict();
            }
            if (this.headItem === null) {
                this.headItem = cacheItem;
                this.tailItem = cacheItem;
            } else {
                cacheItem.next = this.headItem;
                this.headItem.prev = cacheItem;
                this.headItem = cacheItem;
            }
            this.map[id] = cacheItem;
            this.currentSize++;
        } else {
            this.remove(id);
            this.insert(item, id);
        }
    }

    remove(id) {
        if (!this.has(id)) {
            return false;
        }

        const cacheItem = this.get(id);
        if (this.headItem === cacheItem) {
            this.headItem = cacheItem.next;
            this.headItem.prev = null;
        } else if (this.tailItem === cacheItem) {
            this.tailItem = cacheItem.prev;
            this.tailItem.next = null;
        } else {
            cacheItem.next.prev = cacheItem.prev;
            cacheItem.prev.next = cacheItem.next;
        }

        delete this.map[id];

        this.currentSize--;

        return true;
    }

    evict() {
        this.tailItem = this.tailItem.prev;
        this.tailItem.next = null;
        this.currentSize--;
    }

    clear() {
        this.tailItem = null;
        this.headItem = null;
        this.currentSize = 0;
    }

    has(id) {
        return this.map.hasOwnProperty(id);
    }

    get(id) {
        return this.map[id];
    }

    listify() {
        const list = [];
        let current = this.headItem;
        if (current === null) { return list; }
        while (current !== null) {
            list.push(current.item);
            current = current.next;
        }

        if (list[0].hasOwnProperty('name')) {
            list.sort((a, b) => {
                return a.name.length - b.name.length;
            });
        }

        return list;
    }
}

class CacheItem {
    item;
    id;
    next;
    prev;

    constructor(item, id) {
        this.item = item;
        this.id = id;
        this.next = null;
        this.prev = null;
    }
}