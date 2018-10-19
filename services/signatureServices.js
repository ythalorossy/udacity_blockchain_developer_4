const Message = require('bitcore-message');

const { MessageSignature } = require('../model/messageSignature');

class SignatureService {

     validate( messageSignature ) {
        return new Promise((resolve, reject) => {
            try {
                let isValid = Message(messageSignature.message).verify(messageSignature.address, messageSignature.signature)
                resolve(isValid);                
            } catch (error) {
                reject(error)
            } 
        });
    }
}

module.exports = { SignatureService }