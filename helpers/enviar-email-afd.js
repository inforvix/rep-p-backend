const nodemailer = require("nodemailer");

async function sendMailArp(toEmail, filePath) {
  
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
    
       
    let info = await transporter.sendMail({
      from: '"Arquivo A.R.P" <envio@inforvix.com.br>',
      to: toEmail, 
      subject:  "Arquivo A.R.P - Pontovix", 
      text: 'Segue arquivo', 
      html: 'Segue arquivo', 
      attachments: [
        {
          filename: 'arquivo.txt',
          path: filePath,
        }
      ]
      
    });
  
  }

  module.exports = sendMailArp