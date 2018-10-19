const level = require('level');
const db = level('./db-mempool');

class Mempool {

    constructor () {
    }

    add(address, value) {
        return db.put(address, JSON.stringify(value));
    }

    get(address) {
        return db.get(address);
    }

    delete(address) {
        return db.del(address);
    }
}

module.exports = { Mempool }