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
        let evicted = null;
        if (!this.has(id)) {
            if (this.currentSize === this.capacity) {
                evicted = this.evict();
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
            this.bubbleUp(id);
        }
        return evicted;
    }

    bubbleUp(id) {
        if (!this.has(id)) {
            return;
        }

        const cacheItem = this.get(id);
        if (this.headItem === cacheItem) {
            return;
        }

        if (this.tailItem === cacheItem) {
            this.tailItem = cacheItem.prev;
            this.tailItem.next = null;
        } else {
            cacheItem.next.prev = cacheItem.prev;
            cacheItem.prev.next = cacheItem.next;
        }

        this.headItem.prev = cacheItem;
        cacheItem.next = this.headItem;
        this.headItem = cacheItem;
        cacheItem.prev = null;
    }

    evict() {
        let evicted = this.tailItem;
        delete this.map[this.tailItem.id];
        this.tailItem = this.tailItem.prev;
        this.tailItem.next = null;
        this.currentSize--;
        return evicted.item;
    }

    has(id) {
        return this.map.hasOwnProperty(id);
    }

    get(id) {
        return this.map[id];
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