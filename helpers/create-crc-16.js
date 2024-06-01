const crc = require('crc');

const crc_16 = (texto) =>{
    return crc.crc16kermit(texto).toString(16)
  }
  module.exports = crc_16