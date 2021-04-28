class HistoryState {

    next;
    prev;
    data;
    page;
    url;
    title;

    constructor(prev, page, data, url, title) {
        this.next = null;
        this.prev = prev;
        this.page = page;
        this.data = data;
        this.url = url;
        this.title = title;
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