const nodemailer = require("nodemailer");
const assinatura = require("../helpers/assinatura-eletronica")

// function dataFormatada(dataMarc){
//     var data = dataMarc,
//         dia  = data.getDate().toString().padStart(2, '0'),
//         mes  = (data.getMonth()+1).toString().padStart(2, '0'), //+1 pois no getMonth Janeiro começa com zero.
//         ano  = data.getFullYear();
//     return dia+"/"+mes+"/"+ano;
// }

async function sendMail(func, marc, dataPadrao) {
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "pod51028.outlook.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "envio@inforvix.com.br", // generated ethereal user
        pass: "Suporte@123", // generated ethereal password
      },
    });
  
    //dataPadrao = marc.data//dataFormatada(marc.data)
    
    const assinaturaComprovante = assinatura(
      "Comprovante de Registro de Ponto do Trabalhador"+marc.nsr+
      marc.cnpj+marc.local+func.nome+marc.cpf+dataPadrao+
      marc.hora+marc.inpi_codigo+marc.crc16_sha256
      ,'1234');

    // send mail with defined transport object
    texto = "Comprovante de Registro de Ponto do Trabalhador"+
            "NSR: "+marc.nsr+'\n'+
            "CNPJ: "+marc.cnpj+'\n'+
            "Local: "+marc.local+'\n'+
            "Nome: "+func.nome+'\n'+
            "CPF: "+marc.cpf+'\n'+
            "Data: "+dataPadrao+'\n'+
            "Hora: "+marc.hora+'\n'+
            "NFR: "+marc.inpi_codigo+'\n'+
            "hash: "+marc.crc16_sha256+'\n'+
            "Assinatura: "+assinaturaComprovante;

    textoHTML= "<p>Comprovante de Registro de Ponto do Trabalhador <p>"+
            "<p>NSR: "+marc.nsr+"</p>"+
            "<p>CNPJ: "+marc.cnpj+"</p>"+
            "<p>Local: "+marc.local+"</p>"+
            "<p>Nome: "+func.nome+"</p>"+
            "<p>CPF: "+marc.cpf+"</p>"+
            "<p>Data: "+dataPadrao+"</p>"+
            "<p>Hora: "+marc.hora+"</p>"+
            "<p>NFR: "+marc.inpi_codigo+"</p>"+
            "<p>hash: "+marc.crc16_sha256+"</p>"+
            "<p>Assinatura: "+assinaturaComprovante+"</p>"      
    let info = await transporter.sendMail({
      from: '"Comprovante Pontovix Rep-P" <envio@inforvix.com.br>', // sender address
      to: func.email, // list of receivers
      subject:  dataPadrao+" "+ marc.hora+" Registro de Ponto - Pontovix", // Subject line
      text: texto, // plain text body
      html: textoHTML, // html body
    });
  
  }

  module.exports = sendMail