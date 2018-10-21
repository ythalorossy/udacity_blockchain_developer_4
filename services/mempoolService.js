const level = require('level');
const db = level('./db-mempool');

class Mempool {

    constructor() {
    }

    add(address, transaction) {
        return db.put(address, JSON.stringify(transaction));
    }

    get(address) {
        return new Promise((resolve, reject) => {
            db.get(address)
                .then(grant => {
                    resolve(JSON.parse(grant));
                })
                .catch(err => {
                    const error = new Error(`Address [${address}] don't have transactions in Mempool`);
                    error.status = 404;
                    reject(error)
                });
        })
    }

    delete(address) {
        return db.del(address);
    }
}

module.exports = { Mempool }