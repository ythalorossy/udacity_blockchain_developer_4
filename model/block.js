class Block {
    constructor (_address, _star) {
        this.address = _address;
        this.star = _star;
    }

    toString() {
        return JSON.stringify(this);
    }
}