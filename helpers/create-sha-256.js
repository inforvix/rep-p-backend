const { createHash } = require('crypto');
const hash_sha256 = (texto) =>{
    return createHash('sha256').update(texto).digest('hex');
  }
  module.exports = hash_sha256