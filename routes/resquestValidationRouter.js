var express = require('express');
var router = express.Router();

const { ValidationResponse } = require('../model/validation');

// Mempool
const { Mempool } = require('../services/mempoolService')
const mempool = new Mempool();

router
    .post('/', function (req, res) {

        const body = req.body;

        mempool.get(body.address)
            .then(transaction => {

                transaction = JSON.parse(transaction);

                const currentTime = new Date().getTime()
                let leftWindonTime = 0;

                // Check if the window ain't expired
                if (currentTime <= transaction.validationWindow) {
                    leftWindonTime = Math.round((transaction.validationWindow - currentTime) / 1000);
                } else {
                    mempool.delete(transaction.address);
                }

                res.json(new ValidationResponse(transaction.address, transaction.timestamp, transaction.message, leftWindonTime));
            })
            .catch(err => {

                if (err.type == 'NotFoundError') {

                    const timestamp = new Date().getTime();
                    const address = body.address;
                    const message = `${address}:${timestamp}:starRegistry`;
                    const fiveMinutes = (60000 * 5); // 60s x 5 = 5min;
                    const validationWindow = timestamp + fiveMinutes;

                    mempool.add(address, { address, timestamp, message, validationWindow })
                        .then(() => {
                            res.json(new ValidationResponse(address, timestamp, message, fiveMinutes / 1000));
                        });

                } else {
                    res.status(500).json(err);
                }
            })
    });

module.exports = router;
