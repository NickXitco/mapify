class HistoryState {

    next;
    prev;
    data;
    page;
    url;

    constructor(prev, page, data, url) {
        this.next = null;
        this.prev = prev;
        this.page = page;
        this.data = data;
        this.url = url;
    }

    detachSelf() {
        if (this.prev) {
            this.prev.next = this.next;
        }

        if (this.next) {
            this.next.prev = this.prev;
        }
    }

    getData() {
        //TODO get data based on page
        //  i.e, if artist, get data.id
        //  if region/artist, get region and artist, etc.
        //  and safely return if there's a data mismatch.
        return this.data;
    }
}