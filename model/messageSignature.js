class MessageSignature {
    constructor ( _message, _address, _signature) {
        this.message = _message;
        this.address = _address;
        this.signature = _signature;
    }
}

class MessageSignatureResponse {
    constructor ( _registerStar, _status) {
        this.registerStar = _registerStar;
        this.status = _status;
    }
}

module.exports = { MessageSignature, MessageSignatureResponse };