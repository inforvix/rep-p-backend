//const { MessageMedia, Location } = require("whatsapp-web.js");
const axios = require("axios");
const assinatura = require("../helpers/assinatura-eletronica");

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

async function sendZap(func, marc, dataPadrao) {
    //if (!authed){
    //  client.getState().then((data) => {
    //  if (!data){
    //    console.log(data);
    //    return;
    //  }
    //}).catch((err) => {
    //  if (err) {
     //   console.log("DISCONNECTED");
     //   return;
     // }
    //})}

    // if (!authed){
    //     await sleep(6000);
    // }

    // if (!authed){
    //     await sleep(6000);
    // }

    // if (!authed){
    //     await sleep(2000);
    // }

    // if (!authed){
    //     await sleep(2000);
    // }

    // if (!authed){
    //     return
    // }

    const assinaturaComprovante = assinatura(
        "Comprovante de Registro de Ponto do Trabalhador"+marc.nsr+
        marc.cnpj+marc.local+func.nome+marc.cpf+dataPadrao+
        marc.hora+marc.inpi_codigo+marc.crc16_sha256
        ,'1234');

        texto = "*Comprovante de Registro de Ponto do Trabalhador*"+'\n'+'\n'+
        "NSR: "+marc.nsr+'\n'+
        "CNPJ: "+marc.cnpj+'\n'+
        "Local: "+marc.local+'\n'+
        "Nome: "+func.nome+'\n'+
        "CPF: "+marc.cpf+'\n'+
        "Data: "+dataPadrao+'\n'+
        "Hora: "+marc.hora+'\n'+
        "NFR: "+marc.inpi_codigo+'\n'+'\n'+
        "hash: "+marc.crc16_sha256+'\n'+'\n'+
        "Assinatura: "+assinaturaComprovante;    

        if (func.celular != undefined ) {
          const url = 'http://www.inforvix.com.br:5001/chat/sendmessage/'+func.celular;
          const token = 'Bearer HF54JO92347OPT26WCLJHSQFXJSDVHN';
          axios.defaults.headers.common['Authorization'] = token;
        
          axios({
            method: 'post',
            url: url,
            data: {
              message: texto
            }
          })        
            .then(response => {
              // Trate a resposta da API
              console.log(response.data);
            })
            .catch(error => {
              // Lide com erros
              console.error(error);
            });
        }
}

module.exports = sendZap