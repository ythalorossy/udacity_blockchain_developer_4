class ValidationRequest {
    constructor(_address) {
        this.address = _address;
    }
}

class ValidationResponse {
    constructor ( _address, _requestTimeStamp, _message, _validationWindow) {
        this.address = _address;
        this.requestTimeStamp = _requestTimeStamp;
        this.message = _message;
        this.validationWindow = _validationWindow;
    }
}

module.exports = { ValidationRequest, ValidationResponse };