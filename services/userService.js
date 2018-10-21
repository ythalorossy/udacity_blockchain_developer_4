
const level = require('level');
const db = level('./db-user');

class Grant {
    constructor(_address) {
        this.address = _address;
    }
}

class UserService {

    constructor() {
    }

    async grant(address) {
        const grant = new Grant(address);
        return await db.put(address, JSON.stringify(grant));
    }

    async revoke(address) {
        return await db.del(address);
    }

    hasPermission(address) {
        return new Promise( (resolve, reject) => {
            db.get(address)
                .then(grant => {
                    resolve(JSON.parse(grant));
                })
                .catch(err => {
                    const error = Error(`Address [${address}] don't have permissions to register stars. Needs resquest validation again`);
                    error.status = 403;
                    reject(error)
                });
        })
    }
}

module.exports = { UserService, Grant }