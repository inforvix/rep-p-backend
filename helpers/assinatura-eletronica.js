//Assinar e verificar usando chaves públicas e privadas

const fs = require('fs');
// Reading keys from files.
const privateKeyT = fs.readFileSync('./assets/private.key');
var crypto = require('crypto');


const assinatura = (texto, senhaCert) =>{
    var privateKey = crypto.createPrivateKey({
      'key': privateKeyT,
      'format': 'pem',
      'type': 'pkcs8',
      'cipher': 'aes-256-cbc',
      'passphrase': senhaCert
    });

    var signToken = crypto.createSign('SHA256');
    signToken.write(texto);
    signToken.end();
    return signToken.sign({ 'key': privateKey, 'passphrase': senhaCert }, 'hex');
    
  }
  module.exports = assinatura
