# Private Block Chain Notorize Service

## API to notorize, verify wallet address, register star, share star stories and lookup stars in private blockchain

The goal is to allow users to notarize star ownership using their blockchain identity. 
Below are the new features you will build into your application.

| Service | Description |
| --- | --- |
| Notarize  | Users will be able to notarize star ownership using their blockchain identity |
| Verify Wallet Address	| Your application will provide a message to your user allowing them to verify their wallet address with a message signature |
| Register a Star |	Once a user verifies their wallet address, they have the right to register the star |
| Share a Story | Once registered, each star has the ability to share a story |
| Star Lookup | Users will be able to look up their star by hash, block height, or wallet address |

## Getting Started

### Prerequisites

* [NodeJS](https://nodejs.org/en/)
* [ExpressJS](http://expressjs.com/)
* [JSONSchema](https://www.npmjs.com/package/jsonschema)

### Installing

Install the dependecies of the project running the following command on the terminal or command line: 
```
npm install
```

### Running the project

Execute on the terminal:

```
npm start
```
Or
```
node ./bin/www
```

### First access

After start the project you can access the address [http://localhost:8080](http://localhost:8080) to see how to call the addresses.

### API addresses

After the project is running the following resources will accessible:

| HTTP method | URL | Description   |
| ---   | --- | --- | --- |
| POST  | http://localhost:8000/requestValidation | Request data to sign using the own address |
| POST  | http://localhost:8000/message-signature/validate | Send signed message to be validate and grant access to user |
| POST  | http://localhost:8000/block | Register a block that contains information about the start |
| GET   | http://localhost:8000/stars/hash:[HASH] | Request one start based on the block's hash |
| GET   | http://localhost:8000/stars/address:[ADDRESS] | Request all start to a specific wallet address |
| GET   | http://localhost:8000/block/[HEIGHT] | Request a specific block based on the height |

### Validation

### Send block with start
- The request body needs match the shema defined.
- The property story must be only ASCII characters and not more than 500 bytes.

## Contributing

For more details about my personal projects read [Ythalo Rossy](https://github.com/ythalorossy).

## Authors

* **Ythalo Rossy** - *Initial work* - [ythalorossy](https://github.com/ythalorossy)

## License

This project is licensed under the MIT License

## Acknowledgments

* Blockchain
* Expressjs
* Node.JS
* LeveDB
* JSONSchema
* CryptoJS
* Bitcore Message
