class HistoryState {

    next;
    prev;
    data;
    page;

    constructor(prev, page, data) {
        this.next = null;
        this.prev = prev;
        this.page = page;
        this.data = data;
    }

    getData() {
        //TODO get data based on page
        //  i.e, if artist, get data.id
        //  if region/artist, get region and artist, etc.
        //  and safely return if there's a data mismatch.
        return this.data;
    }

}