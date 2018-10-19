const Validator = require('jsonschema').Validator;


Validator.prototype.customFormats.SHA256 = function (input) {
    
    return RegExp(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/).test(input);
};

const v = new Validator();

const StarSchema = {
    "id": "/Star",
    "type": "object",
    "properties": {
        "dec": { "type": "string" },
        "ra": { "type": "string" },
        "magnitude": { "type": "string" },
        "constellation ": { "type": "string" },
        "story": { "type": "string" }
    },
    "required": ["dec", "ra", "story"]
};
v.addSchema(StarSchema, '/Star');

const BlockSchema = {
    "id": "/Block",
    "type": "object",
    "properties": {
        "address": { "type": "SHA256" , format: 'SHA256'},
        "star": { "$ref": "/Star" }
    },
    "required": ["address"]
};
v.addSchema(BlockSchema, '/Block');


const Schemas = Object.freeze({
    BLOCK: Symbol("BLOCK")
});

class JSONSchemaValidator {

    constructor() {
        this.validator = require('jsonschema').Validator;
    }

    validate(json) {

        const result = { isValid: true, errors: []}

        const validation = v.validate(json, BlockSchema);

        if (validation.errors.length > 0) {

            result.isValid = false;

            validation.errors.forEach( error => {
                let property = error.property.replace('instance', 'json');
                result.errors.push( `${property} ${error.message}`);
            })
        }

        return result;
    }

}

module.exports = { JSONSchemaValidator }


