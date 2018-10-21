var express = require('express');
var router = express.Router();

const { ValidationResponse } = require('../model/validation');

// Mempool
const { Mempool } = require('../services/mempoolService')
const mempool = new Mempool();

router
    .post('/', async (req, res, next) => {
        
        const body = req.body;

        try {
            const transaction = await mempool.get(body.address)
    
            const currentTime = new Date().getTime();
    
            if (currentTime <= transaction.validationWindow) {
                leftWindonTime = Math.round((transaction.validationWindow - currentTime) / 1000);

            } else {
                mempool.delete(transaction.address);
            }

            res.json(new ValidationResponse(transaction.address, transaction.timestamp, transaction.message, leftWindonTime));
            
        } catch (error) {

            if (error.status === 404) {

                const timestamp = new Date().getTime();
                const address = body.address;
                const message = `${address}:${timestamp}:starRegistry`;
                const fiveMinutes = (60000 * 5); // 60s x 5 = 5min;
                const validationWindow = timestamp + fiveMinutes;

                await mempool.add(address, { address, timestamp, message, validationWindow })

                res.json(new ValidationResponse(address, timestamp, message, fiveMinutes / 1000));

            } else {
                
                next(error)
            }
        }

    });

module.exports = router;
