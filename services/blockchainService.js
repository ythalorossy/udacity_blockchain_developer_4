const SHA256 = require('crypto-js/sha256');
const level = require('level');
const db = level('./db-blockchain');

const { StringService } = require('./stringService');

const stringService = new StringService();

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
    this.checkIsHasGenesisBlock();
  }

  async checkIsHasGenesisBlock () {
    const height = await this.getBlockHeight();
    if (height === 0) {

      const block = new Block({
        address: '', 
        star: {
          dec: '', 
          ra: '', 
          story: stringService.toHex('Genesis block')
        }
      });
      
      await this.addBlock(block);
      
      console.log("Genesis block has been created")
    }
  }

  // Add new block
  async addBlock(block) {

    // TODO: delegate this constraint to out of this function
    if (!block.body || block.body === '') {
      reject({message: `Body could not be empty`});
    }

    // Block height
    const height = await this.getBlockHeight();
    
    if (height > 0) {
      block.height = height;
    }

    // previous block hash
    if (height > 0) {
      const previousBlock = await this.getBlock(height - 1);
      block.previousBlockHash = previousBlock.hash;
    } else {
      block.previousBlockHash = "";
    }
     
    // UTC timestamp
    block.time = new Date().getTime().toString().slice(0, -3);
    // Hash
    block.hash = SHA256(JSON.stringify(block)).toString();
    // Persist block
    await db.put(block.height, JSON.stringify(block).toString())

    return await db.get(block.height);

  }

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

  getBlock(height) {
    return new Promise((resolve, reject) => {
      db.get(height)
        .then(block => {
          resolve(JSON.parse(block));
        })
        .catch(() => {
          const error = Error(`Not found block with height [${height}]`);
          error.status = 404;
          reject(error);
        });
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