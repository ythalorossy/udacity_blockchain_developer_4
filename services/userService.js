
const level = require('level');
const db = level('./db-user');

class Grant {
    constructor (_address, _access) {
        this.address = _address;
        this.access = _access;
    }
}

class UserService {

    constructor () {
    }

    grant(address) {
        const grant = new Grant(address, true);
        return db.put(address, JSON.stringify(grant));
    }

    revoke(address) {
        return db.put(address, JSON.stringify(new Grant(address, false)));;
    }

    getGrant(address) {
        return new Promise((resolve, reject) => {
            db.get(address)
              .then(grant => {
                resolve(JSON.parse(grant));
              })
              .catch(err => reject(new Error('NOT_FOUND')));
          });
    }

    delete(address) {
        return db.del(address);
    }
}

module.exports = { UserService, Grant }