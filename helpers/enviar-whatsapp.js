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
    "Comprovante de Registro de Ponto do Trabalhador" + marc.nsr +
    marc.cnpj + marc.local + func.nome + marc.cpf + dataPadrao +
    marc.hora + marc.inpi_codigo + marc.crc16_sha256
    , '1234');

  texto = "*Comprovante de Registro de Ponto do Trabalhador*" + '\n' + '\n' +
    "NSR: " + marc.nsr + '\n' +
    "CNPJ: " + marc.cnpj + '\n' +
    "Local: " + marc.local + '\n' +
    "Nome: " + func.nome + '\n' +
    "CPF: " + marc.cpf + '\n' +
    "Data: " + dataPadrao + '\n' +
    "Hora: " + marc.hora + '\n' +
    "NFR: " + marc.inpi_codigo + '\n' + '\n' +
    "hash: " + marc.crc16_sha256 + '\n' + '\n' +
    "Assinatura: " + assinaturaComprovante;

  if (func.celular != undefined) {


    const senhaDoEvulation = 'B6D711FCDE4D4FD5936544120E713976';
    const instanciaCriada = 'inforvix-sistemas-0343';
    const numeroDestinatario = func.celular; // Substitua pelo número do destinatário
    const url = `http://192.168.11.1:8080/message/sendText/${instanciaCriada}`;

    const data = {
      number: `+55${numeroDestinatario}`,
      options: {
        delay: 1200,
        presence: 'composing',
        linkPreview: false
      },
      textMessage: {
        text: texto
      }
    };

    axios.post(url, data, {
      headers: {
        'apiKey': senhaDoEvulation,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    })
      .then(response => {
        console.log('Guedes sucesso:', response.data);
      })
      .catch(error => {
        console.error('Guedes erro:', error);
      });

  }
}

module.exports = sendZap