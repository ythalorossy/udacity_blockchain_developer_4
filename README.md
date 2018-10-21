# Notarize Stars Service in Private Blockchain

One Paragraph of project description goes here

This project provide an API to notarize stars inside a private blockchain. 
It provides a way to requests a message verification, emulates a mempool, checks if the message verification was signed correctly using the user wallet address and stores block into a private blockchain. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

To run and test the project is necessar have installed:
* [NodeJS](http://www.nodejs.org/en).
* [cURL](https://curl.haxx.se/)

### Installing

To install all the dependecies of the project is necessary run the following command on the terminal on the same folder that are the package.json file: 

```
npm install
```

After run this command the project will be prepare to be started.

## Statint the project

On the same folder, where is located the package.json file, execute the following commando on the terminal:

```
npm start
```
Or
```
node ./bin/www
```

## API Definitions

The following table shows the HTTP method, the resources and description of which API: 

| Method | URL | Description   |
| :-------------| :------------- | :------------- |
| POST          | http://localhost:8000/requestValidation   | Request data to sign using the own address |
| POST          | http://localhost:8000/message-signature/validate | Send signed message to be validate and grant access to user |
| POST          | http://localhost:8000/block | Register a start sending information |
| GET           | http://localhost:8000/stars/hash:[HASH] | Request one start based on the block's hash |
| GET           | http://localhost:8000/stars/address:[ADDRESS] | Request all start to a specific wallet address |
| GET           | http://localhost:8000/block/[HEIGHT] | Request a specific block based on the height |

## Testing 

Which resource can be tested using the following examples:

### Request data to sign using the own address

[http://localhost:8000/requestValidation](href='http://localhost:8000/requestValidation')

* Response should contain message details, request timestamp, and time remaining for validation window.
* User obtains a response in JSON format with a message to sign.
* Message format = [walletAddress]:[timeStamp]:starRegistry
* The request must be configured with a limited validation window of five minutes.
* When re-submitting within validation window, validation window should reduce until it expires.


Call resource using CURL

```
curl -X POST http://localhost:8000/requestValidation \
    -H 'Content-Type: application/json' \
    -d '{
    "address": "18JBaTAWaqjhKjdAjqqnNx1jGk2fT6ax3a"
    }'
```

JSON response
```
{
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "requestTimeStamp": "1532296090",
    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
    "validationWindow": 300
}
```

### Send signed message to be validate and grant access to user

[http://localhost:8000/message-signature/validate](href='http://localhost:8000/message-signature/validate')

After call the [http://localhost:8000/requestValidation](href='http://localhost:8000/requestValidation') the user needs to get the message from the JSON response and [sign](https://support.blockchain.com/hc/en-us/articles/210353833-What-is-message-signing-and-how-can-I-do-that-) using your wallet's address. 

* Web API post endpoint validates message signature with JSON response.
* Upon validation, the user is granted access to register a single star.

Call resource using CURL

```
curl -X POST \
  http://localhost:8000/message-signature/validate \
  -H 'Content-Type: application/json' \
  -d '{
  "address": "18JBaTAWaqjhKjdAjqqnNx1jGk2fT6ax3a",
  "signature": "H1T6fELm/jmCuA/O5ZbZLwDLSWbKd8ktR9EE5KZ3UFCEaJi4P5f+nbaQt24biQVIALMfGBJHwG1qrZUkmlmYdqo="
}'
```

JSON response
```
{
  "registerStar": true,
  "status": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "requestTimeStamp": "1532296090",
    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
    "validationWindow": 193,
    "messageSignature": "valid"
  }
}
```

The registerStar and status.messageSignature on the JSON response means that the signature were validate, or not with success. If yes, the registerStar field will return TRUE.

### Register a start sending information

[http://localhost:8000/block](http://localhost:8000/block')

After call the [http://localhost:8000/requestValidation](href='http://localhost:8000/requestValidation') the user needs to get the message from the JSON response and [sign](https://support.blockchain.com/hc/en-us/articles/210353833-What-is-message-signing-and-how-can-I-do-that-) using your wallet's address. 

* Star object and properties are stored within the body of the block.
* Star properties include the coordinates with encoded story.
* Star story supports ASCII text, limited to 250 words (500 bytes), and hex encoded.


Call resource using CURL

```
curl -X POST \
  http://localhost:8000/block \
  -H 'Content-Type: application/json' \
  -d '{
  "address": "18JBaTAWaqjhKjdAjqqnNx1jGk2fT6ax3a",
  "star": {
    "dec": "-69° 99'\'' 30.9",
    "ra": "20h 45m 10.0s",
    "story": "YRoss Start 99X99;"
  }
}'
```

JSON response
```
{
    "hash": "aa4b57ba503a663103156b4387cd55ee6268b748debe0e9d98e213588c3bb7b5",
    "height": 2,
    "body": {
        "address": "18JBaTAWaqjhKjdAjqqnNx1jGk2fT6ax3a",
        "star": {
            "dec": "-69° 99' 30.9",
            "ra": "20h 45m 10.0s",
            "story": "59526f73732053746172742039395839393b"
        }
    },
    "time": "1540091031",
    "previousBlockHash": "117977c799d09bdd518829122ec6b0e724705e0ff4112116433a4deeaa1a546e"
}
```

The body.star.story field on the JSON response, when the block were putted on the blockchain, returns encoded in [Hexadecimal](https://en.wikipedia.org/wiki/Hexadecimal). 

### Request one star based on the block's hash

[http://localhost:8000/stars/hash:[HASH]](http://localhost:8000/stars/hash:[HASH]')

* Request a star using the block's hash
* Response includes entire star block contents along with the addition of star story decoded to ascii.

Call resource using CURL

```
curl -X GET \
http://localhost:8000/stars/hash:117977c799d09bdd518829122ec6b0e724705e0ff4112116433a4deeaa1a546e \
-H 'Content-Type: application/json'
```

JSON response
```
{
    "hash": "117977c799d09bdd518829122ec6b0e724705e0ff4112116433a4deeaa1a546e",
    "height": 1,
    "body": {
        "address": "18JBaTAWaqjhKjdAjqqnNx1jGk2fT6ax3a",
        "star": {
            "dec": "-69° 99' 30.9",
            "ra": "20h 45m 10.0s",
            "storyDecoded": "YRoss Start 99X99;"
        }
    },
    "time": "1540090695",
    "previousBlockHash": "c67d25314d24e5b5e638b95898b1f6b4baf4b2984274d4f683566237b1316ef6"
}
```

The returned JSON response contains the storyDecoded field decoded from hexadecimal to original plain text sent on the registration of the star.

### Request all start to a specific wallet address

[http://localhost:8000/stars/address:[ADDRESS]](http://localhost:8000/stars/address:[ADDRESS]')

* Response includes entire star block contents along with the addition of star story decoded to ascii.
* Multiple stars might be registered to a single blockchain identity.
* The response should support multiple star blocks.

Call resource using CURL

```
curl -X GET \
  http://localhost:8000/stars/address:18JBaTAWaqjhKjdAjqqnNx1jGk2fT6ax3a \
  -H 'Content-Type: application/json' 
```

JSON response
```
[
    {
        "hash": "117977c799d09bdd518829122ec6b0e724705e0ff4112116433a4deeaa1a546e",
        "height": 1,
        "body": {
            "address": "18JBaTAWaqjhKjdAjqqnNx1jGk2fT6ax3a",
            "star": {
                "dec": "-69° 99' 30.9",
                "ra": "20h 45m 10.0s",
                "storyDecoded": "YRoss Start 99X99;"
            }
        },
        "time": "1540090695",
        "previousBlockHash": "c67d25314d24e5b5e638b95898b1f6b4baf4b2984274d4f683566237b1316ef6"
    },
    {
        "hash": "aa4b57ba503a663103156b4387cd55ee6268b748debe0e9d98e213588c3bb7b5",
        "height": 2,
        "body": {
            "address": "18JBaTAWaqjhKjdAjqqnNx1jGk2fT6ax3a",
            "star": {
                "dec": "-69° 99' 30.9",
                "ra": "20h 45m 10.0s",
                "storyDecoded": "YRoss Start 99X99;"
            }
        },
        "time": "1540091031",
        "previousBlockHash": "117977c799d09bdd518829122ec6b0e724705e0ff4112116433a4deeaa1a546e"
    }
]
```

### Request a specific block based on the height

[http://localhost:8000/block/[HEIGHT]](http://localhost:8000/block/[HEIGHT]')

* Response includes entire star block contents along with the addition of star story decoded to ascii.
* Multiple stars might be registered to a single blockchain identity.
* The response should support multiple star blocks.

Call resource using CURL

```
curl -X GET \
  http://localhost:8000/block/1 \
  -H 'Content-Type: application/json' 
```

JSON response
```
{
    "hash": "117977c799d09bdd518829122ec6b0e724705e0ff4112116433a4deeaa1a546e",
    "height": 1,
    "body": {
        "address": "18JBaTAWaqjhKjdAjqqnNx1jGk2fT6ax3a",
        "star": {
            "dec": "-69° 99' 30.9",
            "ra": "20h 45m 10.0s",
            "storyDecoded": "YRoss Start 99X99;"
        }
    },
    "time": "1540090695",
    "previousBlockHash": "c67d25314d24e5b5e638b95898b1f6b4baf4b2984274d4f683566237b1316ef6"
}
```

## Deployment

This project was besed over ExpressJS framework. You can understand how to deploy on production environment on the
[https://expressjs.com/en/advanced/best-practice-performance.html](https://expressjs.com/en/advanced/best-practice-performance.html)

## Built With

* [NodeJS](https://nodejs.org/en/)
* [ExpressJS](http://expressjs.com/)
* [JSONSchema](https://www.npmjs.com/package/jsonschema)
* [LevelDB](http://leveldb.org/)

## Contributing

I am the only contributor.
For more details about my personal projects read [Ythalo Rossy](https://github.com/ythalorossy).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/ythalorossy/udacity_blockchain_developer_4/tags). 

## Authors

* **Ythalo Rossy S. Lira** - *Initial work* - [Udacity Blockchain Developer](https://github.com/ythalorossy/udacity_blockchain_developer_4)

See also the list of [contributors](https://github.com/ythalorossy/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT).

## Acknowledgments

* I am doing the Blockchain Developer course on Udacity
* I can see that the technology field is moving so quickly and inside that moviment are the Blockchain

