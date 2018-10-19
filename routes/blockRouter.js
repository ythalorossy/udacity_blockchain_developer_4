const express = require('express');
const router = express.Router();

const { UserService } = require('../services/userService')
const { BlockchainService, Block } = require('../services/blockchainService');
const { StringService } = require('../services/stringService');
const { JSONSchemaValidator } = require('../services/jsonschemaValidatorService');

const userService = new UserService();
const blockchainService = new BlockchainService();
const stringService = new StringService();
const jsonSchemaValidator = new JSONSchemaValidator();

const contentBodyIsValid = (body) => {
    return new Promise( (resolve, reject) => {

        let isValid = true;

        if (!stringService.isASCII(body.star.story)) {
            isValid = false;
            reject(new Error('Story needs contain only ASCII characters'));
        }

        if (stringService.encode(body.star.story).length > 500) {
            isValid = false;
            reject(new Error('Story contains more than 500 bytes'));
        }

        const jsonValidation = jsonSchemaValidator.validate(body);

        if (!jsonValidation.isValid) {
            isValid = false;
            reject(new Error(JSON.stringify(jsonValidation.errors)));
        }

        if (isValid) {
            resolve(true);
        }
    })
}

router
        .post('/', (req, res) => {

            const body = req.body;

            userService.getGrant(body.address)
            .then( grant => {
                
                if (!grant.access) {
                    throw new Error('User don\'t have permission');
                }

                return contentBodyIsValid(body);
            })
            .then(() => {

                const block = new Block(body);
                block.story = stringService.toHex(body.star.story);

                return blockchainService.addBlock(block);
            })
            .then( newBlock => {

                userService.revoke(body.address);
                userService.delete(body.address);

                res.status(200).json( JSON.parse(newBlock) );
            })
            .catch ( err => {

                if (err.message === 'NOT_FOUND') {
                    res.status(500).json({message: `The validationWindow is out. User must request validation again`});
                } else {
                    res.status(500).json({message: `${err.message}`});
                }

            })
        })
        
        .get('/:height', (req, res) => {

            blockchainService.getBlock(req.params.height)
            .then( blocks => {
                res.json(blocks);
            })
            .catch( err => {

                if (err.message === 'NOT_FOUND') {
                    res.status(404).json({message: `Block not found with heigth equals ${req.params.height}`})
                } else {
                    res.status(500).json({message: `Internal error ${err.message}`});
                }
            });
        });

module.exports = router;