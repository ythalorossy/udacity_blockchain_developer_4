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
    .post('/validate', function (req, res, next) {

        const body = req.body;
        
        mempool.get(body.address)
            .then(transaction => {

                transaction = JSON.parse(transaction);

                const currentTime = new Date().getTime();

                const leftWindonTime = Math.round((transaction.validationWindow - currentTime) / 1000)

                if (leftWindonTime) {

                    const messageSignature = new MessageSignature(transaction.message, body.address, body.signature);

                    signatureService.validate(messageSignature)
                        .then( isValid => {

                            // Grant access to user register a star 
                            if (isValid) {
                                userService.grant(transaction.address);
                                res.status(200).json(new MessageSignatureResponse(isValid, {
                                    address: transaction.address,
                                    requestTimeStamp: transaction.timestamp,
                                    message: transaction.message,
                                    validationWindow: leftWindonTime,
                                    messageSignature: "valid"
                                }));

                            } else {
                                userService.revoke(transaction.address);
                                res.status(200).json(new MessageSignatureResponse(isValid, {
                                    address: body.address,
                                    validationWindow: leftWindonTime,
                                    messageSignature: "invalid"
                                }));
                            }

                            // const messageSignatureResponse =
                            //     new MessageSignatureResponse(isValid, {
                            //         address: transaction.address,
                            //         requestTimeStamp: transaction.timestamp,
                            //         message: transaction.message,
                            //         validationWindow: leftWindonTime,
                            //         messageSignature: isValid ? "valid" : "invalid"
                            //     });

                            //     mempool.delete(body.address);

                            // res.status(200).json(messageSignatureResponse);
                        })
                        .catch(err => {
                            console.error(err);
                            // mempool.delete(body.address);
                            res.status(500).json({ message: err });
                        });
                
                } else {
                    mempool.delete(body.address);
                    throw new Error('Window is out')
                }

            })
            .catch ( err => {
                res.json(new MessageSignatureResponse(false, { validationWindow: 0 }));
            });
    });

module.exports = router;