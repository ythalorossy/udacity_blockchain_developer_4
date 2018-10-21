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

router
        .post('/', async (req, res, next) => {

            try {

                const body = req.body;

                await userService.hasPermission(body.address);

                if (!stringService.isASCII(body.star.story)) {
                    throw Error('Story needs contain only ASCII characters');
                }
        
                if (stringService.encode(body.star.story).length > 500) {
                    throw Error('Story contains more than 500 bytes');
                }
        
                const jsonValidation = await jsonSchemaValidator.validate(body);

                if (!jsonValidation.isValid) {
                    throw Error(JSON.stringify(jsonValidation.errors));
                }

                const block = new Block(body);
                block.body.star.story = stringService.toHex(body.star.story);

                const newBlock = await blockchainService.addBlock(block)
                userService.revoke(body.address);

                res.status(200).json( JSON.parse(newBlock) );
        
            } catch (err) {
                next(err);
            }
        })
        
        .get('/:height', async (req, res, next) => {
            try {
                const block = await blockchainService.getBlock(req.params.height);
                block.body.star.storyDecoded = stringService.fromHex(block.body.star.story);
                delete block.body.star.story
                res.json(block);
            } catch (err) {
                next(err);
            }
        });

module.exports = router;