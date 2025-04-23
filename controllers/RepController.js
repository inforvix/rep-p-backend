const sequelize = require('sequelize')
const {Op} = require('sequelize')
const fs = require('fs')

const Rep = require('../models/Rep-p')
const Empresa = require('../models/Empresa')
const Operador = require('../models/Operador')
const Marcacao = require('../models/Marcacao')

const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const validaCNPJ = require('../helpers/validar-cnpj')
const validaCPF = require('../helpers/validar-cpf')
const crc_16 = require('../helpers/create-crc-16')
const pad = require('../helpers/string-pad')
const archiver = require('archiver');
const afdLayout = require('../helpers/layout-AFD')
const assinatura = require("../helpers/assinatura-eletronica")

module.exports = class RepController{

    static async cadastrar(req,res){
        // erro ao cadastrar segundo rep da empreas 
        const token = getToken(req)
        const empresa = await getUserByToken(token)    
        const inpi = 'BR 51 2025 001324-8'
        const idEmpresa = req.params.idempresa      

        if (empresa.id !== 1){
            return res.status(401).json({message:'Acesso Negado!'})
        }
 
        if (!idEmpresa){
          res.status(422).json({message:'ID da empresa é obrigatório'})
          return
        }
        const Emp = Empresa.findByPk(idEmpresa)
        
        if (!Emp){
          res.status(422).json({message:'Empresa enviada ainda não tem cadastro'})
          return
        }
        try{
            const newrep = await Rep.create(
            {inpi_codigo:inpi,EmpresaId:idEmpresa,ativo:false})//empresaid:EmpresaId,
  
            await newrep.save()
            res.status(200).json({message:'Rep-P cadastrado',newrep})
        }catch(err){
            res.status(500).json(err.message)
        }
    }

    static async showAll(req,res){
        const token = getToken(req)
        const empresa = await getUserByToken(token)
      
        try{
          const reps = await Rep.findAll({ where: { EmpresaId: empresa.id } });
          res.status(200).json(reps)
        }catch(err){
          res.status(500).json(err.message)
        }
        
    }      

    static async dell(req,res){
        const token = getToken(req)
        const empresa = await getUserByToken(token)
        const repId = req.params.id
        let rep

        if (empresa.id !== 1){
          return res.status(401).json({message:'Acesso Negado!'})
        }


        try{
          rep = await Rep.findByPk(repId)
        }catch(err){
          res.status(500).json(err.message)
        }
    
        if (!rep){
            return res.status(422).json({message:'Rep-P não encontrado'})
        }

        const marcacoes = await rep.getMarcacao();
        if (marcacoes){
            return res.status(422).json({message:'Este Rep-P já possui marcações e não pode ser excluido'})
        }
    
        try {
          funcionario.destroy();
          return res.status(200).json({message:'Rep-P Apagado!'})
        }catch(err){
          res.status(500).json({message:err.message})
        }
    
    }
     
    static async getById(req,res){ 
        const token = getToken(req)
        const emp = await getUserByToken(token) 
        
        try{
          const id = req.params.id
          const rep = await Rep.findByPk(id)
          if (!rep){
            res.status(422).json({message:'Rep não encontrado'})
          }               
          //ou a propria empresa logada vê seu rep ou  a inforvix 
          if (rep.EmpresaId != emp.id && emp.id != 1){
            return res.status(401).json({message:'Acesso Negado! Rep não pertence a sua empesa'})
          }
          
          res.status(200).json(rep)
    
        }catch(err){
          res.status(500).json(err.message)
        }
    }

    static async getRepByCNPJ(req,res){ 
        const token = getToken(req)
        const emp = await getUserByToken(token) 
        
        try{
          const cnpj = req.params.cnpj
          const reps = await Rep.findAll({ where: { EmpresaId: emp.id, cnpj_cpf_emp: cnpj } });
          if (!reps){
            res.status(422).json({message:'Rep não encontrado'})
          }               
                   
          res.status(200).json(reps)
    
        }catch(err){
          res.status(500).json(err.message)
        }
    }

    static async editRep(req,res){
        const token = getToken(req)
        const empresa = await getUserByToken(token) 
        let cpfResponsavel = req.get('cpfResponsavel')
        
        if (!cpfResponsavel){
          return res.status(422).json({message:'Para enviar informações pro REP, a portaria 671 requer um CPF do responsavel!'})
        }
        
        const Ope = await Operador.findOne({ where: { EmpresaId: empresa.id, cpf: cpfResponsavel } })

        if (!Ope){
          return res.status(422).json({message:'CPF do Operador não encontrada, cadastre-o antes de fazer operações'}) 
        }

        if (!validaCPF(cpfResponsavel)){
          return res.status(422).json({message:'CPF inválido'})
        }else{cpfResponsavel = cpfResponsavel.replace(/[^\d]+/g,'');}

        if (!empresa){
          return res.status(422).json({message:'Empresa não encontrada'}) 
        }
        let {cnpj} = req.body
        const {id,local,nome_rep,razao,ativo,numero_serial,empresaid} = req.body
        
        if (empresa.id != empresaid){
          return res.status(401).json({message:'Acesso Negado! Rep não pertence a sua empesa'})
        }

        let rep = new Rep;
        try{
          rep = await Rep.findByPk(id)
        }catch(err){
          return res.status(500).json({message:err.message})
        }

        if (!rep){
          return res.status(422).json({message:'Rep-p não encontrador',codigoRep:id})
        }

        if (nome_rep)
        {rep.nome_rep = nome_rep}
        
        if (razao)
        {rep.razao = razao}  
        
        if (cnpj)
        {
          if (!validaCNPJ(cnpj)){
            return res.status(422).json({message:'CNPJ inválido'})
          }else{cnpj = cnpj.replace(/[^\d]+/g,'')}
          
          rep.cnpj_cpf_emp = cnpj
        }   
        
        if (local)
        {rep.local = local}
        
        if (numero_serial)
          {rep.numero_serial = numero_serial}
        
        if(ativo != undefined)
        {rep.ativo = ativo} 
        
        if(rep.ativo && !rep.local && !rep.cnpj_cpf_emp)  
        {
          return res.status(422).json({message:'Para Ativa o Rep, envie CNPJ e Local'}) 
        }
        try{
          rep.save();
          
          let ultimaMarc = await Marcacao.findOne({
            attributes: [[sequelize.fn('max', sequelize.col('nsr')), 'nsr']],
            where:{RepPId:id},
          }) 
          
          if (ultimaMarc.nsr == null){
            ultimaMarc.nsr = 1;
          }else{ultimaMarc.nsr++}
          const tipoRegistro = 2
          
          var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
          var date = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

          let codigoCrc = ultimaMarc.nsr + tipoRegistro + date+ cpfResponsavel + '1' + rep.cnpj_cpf_emp + razao+ local
          codigoCrc = crc_16(codigoCrc)
          
          const marc = await Marcacao.create({nsr:ultimaMarc.nsr,inpi_codigo:'BR 51 2025 001324-8',cpfResponsavel:cpfResponsavel,cnpj:rep.cnpj_cpf_emp,
          local:rep.local,RepPId:rep.id, tipoRegistro:tipoRegistro,tipoOperacao:'1',crc16_sha256:codigoCrc,razao:razao})
          
          
          res.status(200).json({message:"Rep-p Alterado!"})
        }catch(err){
          res.status(500).json({message:err.message})
        }
  
    }

    static async getHora(req,res){
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      var date = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
      const ano = date.substring(0, 4);
      const mes = date.substring(5, 7);
      const dia = date.substring(8, 10);
      const hora = date.substring(11, 19);
      date = dia+'/'+mes+'/'+ano;
      res.status(200).json({data:date,hora:hora,timezone:'UTC -3 São Paulo'})
    }

    static async afd(req,res){
      //const token = getToken(req)
      //const empresa = await getUserByToken(token) 
      let dataIni = req.get('dataini')
      let dataFim = req.get('datafim')
      if (dataFim){
        dataFim = dataFim.substring(0,8)+ pad.leftPad((parseInt(dataFim.substring(9,11))+1).toString(),2,'0')
      }
      const id = req.params.id
      
      //if (!empresa){
      //  return res.status(422).json({message:'Empresa não encontrada'}) 
     // }
      
      let rep = new Rep;
      try{
        rep = await Rep.findByPk(id)
      }catch(err){
        return res.status(500).json({message:err.message})
      }

      if (rep == null){
        return res.status(403).json({message:'Rep inexistente'})
      }

     // if (empresa.id != rep.EmpresaId){
     //   return res.status(422).json({message:'O Rep-P não é dessa empresa!'}) 
     // }
      //marcação do cabeçalho 
      let Marc = await Marcacao.findOne({ where:{RepPId:rep.id,tipoRegistro:2}
        , order: [
          ['nsr', 'DESC'],
        ],
      }) 
      
      if (dataIni && dataFim){
        var { count, rows } = await Marcacao.findAndCountAll({ where:{RepPId:rep.id, 
          createdAt: {
            [Op.between]: [new Date(dataIni), new Date(dataFim)],
          }},
          order: [
            ['nsr', 'ASC'],
          ],
        }) 
      }else{
        var { count, rows } = await Marcacao.findAndCountAll({ where:{RepPId:rep.id}
          , order: [
            ['nsr', 'ASC'],
          ],
        }) 
      }

      var dataFimRegArq = new Date(rows[count-1].createdAt)
      dataFimRegArq = dataFimRegArq.getFullYear()+'-'+pad.leftPad((dataFimRegArq.getMonth()+1).toString(),2,'0')+'-'+pad.leftPad(dataFimRegArq.getDate().toString(),2,'0')
     
      var dataIniRegArq = new Date(rows[0].createdAt)
      dataIniRegArq = dataIniRegArq.getFullYear()+'-'+pad.leftPad((dataIniRegArq.getMonth()+1).toString(),2,'0')+'-'+pad.leftPad(dataIniRegArq.getDate().toString(),2,'0')

      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      var _date = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

      const cnpj = Marc.cnpj;
      
      const nomeArq = `./public/afd/AFD_#inipcodigo#_${cnpj}_\REP_P${rep.id}.txt`
      const nomeArqCripto = `./public/afd/AFD_#inipcodigo#_${cnpj}_\REP_P${rep.id}.txt.p7s`
      
      const arquivos = [
        {
          nome: `AFD_#inipcodigo#_${cnpj}_\REP_P${rep.id}.txt`,
          caminho: nomeArq
        },
        {
          nome: `AFD_#inipcodigo#_${cnpj}_\REP_P${rep.id}.txt.p7s`,
          caminho: nomeArqCripto
        }
      ];
      const nomeArquivoZip = `./public/afd/arquivos${rep.id}.zip`;

      let cabecalho =  '00000000011'+
      pad.leftPad(cnpj,14,' ')+
      '              '+
      pad.rightPad(Marc.razao,150,' ')+
      pad.leftPad('#inipcodigo#',17,' ')+
      dataIniRegArq+
      dataFimRegArq+
      _date.substring(0,19) +'-0300'+'0031'+
      '07092191000108'+
      '          '+'          '+'          '
      var crc = crc_16(cabecalho)
      
      const file = fs.createWriteStream(nomeArq);
      const fileCripto = fs.createWriteStream(nomeArqCripto);

      file.write(cabecalho+crc+'\r\n');
      fileCripto.write(assinatura(cabecalho+crc,'1234')+'\r\n')
      //console.log(cabecalho);

      var reg2=0
      var reg5=0
      var reg7=0
      for (const key in rows) {
        if(rows[key].tipoRegistro == 2){
          reg2++ 
          let linha = afdLayout.registro2(rows[key])
          file.write(linha+'\r\n')
          fileCripto.write(assinatura(linha,'1234')+'\r\n')
          //console.log(linha)
        }

        if(rows[key].tipoRegistro == 5){
          reg5++
          let linha = afdLayout.registro5(rows[key])
          file.write(linha+'\r\n')
          fileCripto.write(assinatura(linha,'1234')+'\r\n')
          //console.log(linha)
        }

        if(rows[key].tipoRegistro == 7){
          reg7++
          let linha = afdLayout.registro7(rows[key])
          file.write(linha+'\r\n')
          fileCripto.write(assinatura(linha,'1234')+'\r\n')
          //console.log(linha)
        }
      }

      var trailer = '999999999'+pad.leftPad(reg2.toString(),9,'0')+
      '000000000'+'000000000'+pad.leftPad(reg5.toString(),9,'0')+
      '000000000'+pad.leftPad(reg7.toString(),9,'0')+'9'
      file.write(trailer+'\r\n')
      fileCripto.write(assinatura(trailer,'1234')+'\r\n')
      file.write(pad.rightPad(`AFD_#inipcodigo#_${cnpj}_\REP_P${rep.id}.txt.p7s`,100,' '))
      file.end();
      fileCripto.end();
      //console.log(trailer)
      
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      }); 

      // Criar um arquivo ZIP
      const output = fs.createWriteStream(nomeArquivoZip);
      const zip = archiver('zip', {
        zlib: { level: 9 } // Nível de compressão máximo
      });

      // Definir cabeçalhos da resposta para o download
      res.attachment(nomeArquivoZip);

      // Pipe a saída do arquivo ZIP para a resposta HTTP
      zip.pipe(res);

      // Adicionar cada arquivo ao arquivo ZIP
      arquivos.forEach((arquivo) => {
        zip.append(fs.createReadStream(arquivo.caminho), { name: arquivo.nome });
      });
      
      // Finalizar o arquivo ZIP e enviar a resposta
      await zip.finalize();  
      
      output.close();
      
      // Remover o arquivo ZIP após a conclusão do download
      res.on('finish', () => {
        console.log('finish');
      });

      output.on('close', () => {
        console.log('close');
        fs.unlinkSync(nomeArquivoZip);
      });

    }
}                                                        