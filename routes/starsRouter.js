const express = require('express');
const router = express.Router();

const { BlockchainService } = require('../services/blockchainService');
const { StringService } = require('../services/stringService');

const blockchainService = new BlockchainService();
const stringService = new StringService();

router
    .get('/address::address', (req, res, next) => {

        blockchainService.getBlockByAddress(req.params.address)
            .then( blocks => {
                
                blocks.forEach(block => {
                    block.body.star.storyDecoded = stringService.fromHex(block.body.star.story);
                    delete block.body.star.story
                });

                res.json(blocks);
            })
            .catch( err => {
                res.status(500).json(err);
            });

    })
    .get('/hash::hash', (req, res, next) => {

        blockchainService.getBlockByHash(req.params.hash)
            .then( block => {
                res.json(block || {message: `Block not found with hash equals ${req.params.hash}`});
            })
            .catch( err => {
                res.status(500).json(err);
            });

    })

module.exports = router;