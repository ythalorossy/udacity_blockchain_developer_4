const express = require('express');
const router = express.Router();

const { BlockchainService } = require('../services/blockchainService');
const blockchainService = new BlockchainService();


router
    .get('/address::address', (req, res, next) => {

        blockchainService.getBlockByAddress(req.params.address)
            .then( blocks => {
                res.json(blocks);
            })
            .catch( err => {
                res.status(500).json(err);
            });

    })
    .get('/hash::hash', (req, res, next) => {

        blockchainService.getBlockByHash(req.params.hash)
            .then( blocks => {
                res.json(blocks);
            })
            .catch( err => {
                res.status(500).json(err);
            });

    })

module.exports = router;