const SHA256 = require('crypto-js/sha256');
const level = require('level');

const db = level('./db-blockchain');

class Block {
  constructor(data) {
    this.hash = "";
    this.height = 0;
    this.body = {
      address: data.address,
      star: {
        dec: data.star.dec, 
        ra: data.star.ra,
        mag: data.star.mag,
        const: data.star.const,
        story: data.star.story,
      }
    };
    this.time = 0;
    this.previousBlockHash = "";
  }
}

class BlockchainService {

  constructor() {

    // Check if is necessary create a Genesis block
    this.getBlockHeight().then(height=> {
      if (height === 0) {

        const block = new Block({address: '', star: {dec: '', ra: '', story: 'Genesis block'}});
        
        this.addBlock(block)
          .then(block => console.log("Genesis block has been created"))
          .catch(err => console.log('Error creating Genesis block', err));
      }
    });
  }

  // Add new block
  addBlock(block) {
    return new Promise((resolve, reject) => {

      // TODO: delegate this constraint to out of this function
      if (!block.body || block.body === '') {
        reject({message: `Body could not be empty`});
      }

      // Block height
      const blockHeight = new Promise((resolve, reject) => {
        this.getBlockHeight()
          .then(height => {
            if (height > 0) {
              block.height = height;
            }
            resolve(block);
          });
      });

      // previous block hash
      const previsousBlockHash = new Promise((resolve, reject) => {
        this.getBlockHeight().then(height => {
          if (height > 0) {
            this.getBlock(height - 1)
              .then(previousBlock => {
                block.previousBlockHash = previousBlock.hash;
                resolve(block);
              });
          } else {
            block.previousBlockHash = "";
            resolve(block);
          }
        })
      })

      Promise
        .all([blockHeight, previsousBlockHash])
        .then(values => {
          // UTC timestamp
          block.time = new Date().getTime().toString().slice(0, -3);
          // Hash
          block.hash = SHA256(JSON.stringify(block)).toString();
          // Persist block
          return db.put(block.height, JSON.stringify(block).toString())
        })
        .then(() => {
          return db.get(block.height)
        })
        .then(block => resolve(block))
        .catch(err => reject(err));
    })
  }

  // Get block height
  getBlockHeight() {
    return new Promise((resolve, reject) => {
      let i = 0;
      db.createReadStream()
        .on('data', data => {
          i++;
        })
        .on('error', err => reject(err))
        .on('close', () => {
          resolve(i)
        });
    });
  }

  // get block by height
  getBlock(blockHeight) {
    return new Promise((resolve, reject) => {
      db.get(blockHeight)
        .then(block => {
          resolve(JSON.parse(block));
        })
        .catch(err => reject(new Error("NOT_FOUND")));
    });
  }

  getBlockByAddress(address) {
    return new Promise((resolve, reject) => {

      const resultBlock = [];

      db.createReadStream()
        .on('data', data => {
          let block = JSON.parse(data.value);
          if (block.body.address === address) {
            resultBlock.push( block );
          }
        })
        .on('error', err => reject(err))
        .on('close', () => {
          resolve(resultBlock);
        })
    })
  }

  getBlockByHash(hash) {
    return new Promise((resolve, reject) => {

      let blockResult;

      db.createReadStream()
        .on('data', data => {
          let block = JSON.parse(data.value);
          if (block.hash === hash) {
            blockResult = block;
          }
        })
        .on('error', err => reject(err))
        .on('close', () => {
            resolve(blockResult);
        })
    })
  }

  // getBlockByHeight(height) {
  //   return new Promise((resolve, reject) => {

  //     const resultBlock = [];

  //     db.createReadStream()
  //       .on('data', data => {
  //         let block = JSON.parse(data.value);
  //         if (block.height === +height) {
  //           resultBlock.push( block );
  //         }
  //       })
  //       .on('error', err => reject(err))
  //       .on('close', () => {
  //         resolve(resultBlock);
  //       })
  //   })
  // }

  listAllBlock() {
    db.createReadStream()
        .on('data', data => {
          console.log(data.value);
        })
        .on('error', err => console.log(err))
        .on('close', () => console.log('All blocks listed'));
  }

  // validate block
  validateBlock(blockHeight) {
    return new Promise((resolve, reject) => {
      // get block object
      this.getBlock(blockHeight)
        .then(block => {
          
          // get block hash
          let blockHash = block.hash;
          
          // remove block hash to test block integrity
          block.hash = '';
          
          // generate block hash
          let validBlockHash = SHA256(JSON.stringify(block)).toString();

          // Compare
          if (blockHash === validBlockHash) {
            resolve(true);
          } else {
            reject(false);
          }
        })
        .catch(err => reject(`Block ${blockHeight} not found`));
    });
  }

  // Validate blockchain
  validateChain() {
    let errorLog = [];
    return new Promise((resolve, reject) => {
      db.createReadStream()
        .on('data', data => {
          let block = JSON.parse(data.value);
          this.validateBlock(block.height)
            .then(isValid => { console.log(JSON.parse(data.value).hash, 'is Valid')})
            .catch(err => { errorLog.push(data) });
        })
        .on('error', err => reject(err))
        .on('close', () => {
          return (errorLog.length > 0) 
            ? reject({"errorLength": errorLog.length, "blocks": errorLog}) 
            : resolve(true);
        });
    });
  }
};

module.exports = { Block, BlockchainService };