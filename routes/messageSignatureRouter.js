const express = require('express');
const router = express.Router();

const { SignatureService } = require('../services/signatureServices');
const { MessageSignature, MessageSignatureResponse } = require('../model/messageSignature');
const { Mempool } = require('../services/mempoolService')
const { UserService, Grant } = require('../services/userService')

const mempool = new Mempool();
const signatureService = new SignatureService();
const userService = new UserService();

router
    .post('/validate', async (req, res, next) => {

        const body = req.body;

        try {
            const transaction = await mempool.get(body.address)

            const currentTime = new Date().getTime();

            const leftWindonTime = Math.round((transaction.validationWindow - currentTime) / 1000)

            if (!leftWindonTime) {
                mempool.delete(body.address);
                const error = new Error('Needs resquest validation again. The window time is out.');
                error.status = 403;
                throw error;
            }

            const messageSignature = new MessageSignature(transaction.message, body.address, body.signature);

            const isSignatureValid = await signatureService.validate(messageSignature)

            if (isSignatureValid) {
                userService.grant(transaction.address);
                res.status(200).json(new MessageSignatureResponse(isSignatureValid, {
                    address: transaction.address,
                    requestTimeStamp: transaction.timestamp,
                    message: transaction.message,
                    validationWindow: leftWindonTime,
                    messageSignature: "valid"
                }));

                mempool.delete(body.address);

            } else {
                userService.revoke(transaction.address);
                res.status(200).json(new MessageSignatureResponse(isSignatureValid, {
                    address: body.address,
                    validationWindow: leftWindonTime,
                    messageSignature: "invalid"
                }));
            }

        } catch (error) {

            next(error)
        } 
    });

module.exports = router;