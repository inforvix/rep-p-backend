const pad = require('./string-pad') 
// const crc16 = require('./create-crc-16') 
// const sha256 = require('./create-sha-256') 

function registro2(marcacao) {
    
    var dataGrav = marcacao.createdAt;
    dataGrav = dataGrav.getFullYear()+'-'+pad.leftPad((dataGrav.getMonth()+1).toString(),2,'0')+'-'+pad.leftPad(dataGrav.getDate().toString(),2,'0')+'T'+
    +pad.leftPad(dataGrav.getHours().toString(),2,'0')+':'+pad.leftPad(dataGrav.getMinutes().toString(),2,'0')+':'+pad.leftPad(dataGrav.getSeconds().toString(),2,'0')+'-0300'

    //var dataPonto = marcacao.data+marcacao.hora

    const linha = pad.leftPad(marcacao.nsr,9,'0')+"2"+
    dataGrav+
    pad.rightPad(marcacao.cpfResponsavel,14,' ')+"1"+
    marcacao.cnpj+'              '+
    pad.rightPad(marcacao.razao,150,' ')+
    pad.rightPad(marcacao.local,100,' ')+
    marcacao.crc16_sha256
    
    //const crc = crc16(linha)

    return linha//+crc
};

function registro5(marcacao) {
    var _date = marcacao.createdAt;
    _date = _date.getFullYear()+'-'+pad.leftPad((_date.getMonth()+1).toString(),2,'0')+'-'+pad.leftPad(_date.getDate().toString(),2,'0')+'T'+
    +pad.leftPad(_date.getHours().toString(),2,'0')+':'+pad.leftPad(_date.getMinutes().toString(),2,'0')+':'+pad.leftPad(_date.getSeconds().toString(),2,'0')+'-0300'

    const linha = pad.leftPad(marcacao.nsr,9,'0')+"5"+
    _date+
    marcacao.tipoOperacao+
    pad.rightPad(marcacao.cpf,12,' ')+
    pad.rightPad(marcacao.nome,52,' ')+'    '+
    pad.rightPad(marcacao.cpfResponsavel,11,' ')+
    marcacao.crc16_sha256
    
    //const crc = crc16(linha)

    return linha//+crc
};

function registro7(marcacao) {
    var dataGrav = marcacao.createdAt;
        
    const horaGrav = 'T'+pad.leftPad(dataGrav.getHours().toString(),2,'0')+':'+pad.leftPad(dataGrav.getMinutes().toString(),2,'0')+':'+pad.leftPad(dataGrav.getSeconds().toString(),2,'0')+'-0300'
    dataGrav = dataGrav.getFullYear()+'-'+pad.leftPad((dataGrav.getMonth()+1).toString(),2,'0')+'-'+pad.leftPad(dataGrav.getDate().toString(),2,'0')

    const linha = pad.leftPad(marcacao.nsr,9,'0')+"7"+
    marcacao.data+'T'+marcacao.hora+'-0300'+
    pad.rightPad(marcacao.cpf,12,' ')+
    dataGrav+horaGrav+
    marcacao.tipoOperacao+marcacao.online+
    marcacao.crc16_sha256
       
    //const sha_256 = sha256(linha)

    return linha//+sha_256
};

  module.exports = {registro2, registro5, registro7}