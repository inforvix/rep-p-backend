const sequelize = require('sequelize')
const {Op} = require('sequelize')

const FunRep = require('../models/FuncionarioRep')
const Rep = require('../models/Rep-p')
const Funcionario = require('../models/Funcionario')
const Marcacao = require('../models/Marcacao')

const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const sendMail = require('../helpers/enviar-email')
const sendZap = require('../helpers/enviar-whatsapp')
const hash_sha256 = require('../helpers/create-sha-256')
module.exports = class MarcacaoController{

  static async registraCPF(req,res){
    const cpf = req.params.cpf
    const repid = req.params.id

    const token = getToken(req)
    const empresa = await getUserByToken(token) 
    const online = 0 //rep-p Informar "0" para marcação on-line ou "1" para marcaçãooff-line.
    const tipoRegistro = 7
    const tipoOperacao = req.get('tipoOperacao') //rep-p "01": aplicativo mobile; "02":browser(navegador internet); "03": aplicativo desktop; "04": dispositivo eletrônico; "05": outro dispositivo eletrônico não especificado acima.
        

    if (!cpf){
      return res.status(422).json({message:'O CPF é obrigatório'})
    }

    if (!repid){
      return res.status(422).json({message:'O ID do Rep-P é obrigatório'})
    }

    try{
      const funcionario = await Funcionario.findOne({where:{cpf:cpf,EmpresaId:empresa.id}})
      if (!funcionario){
        return res.status(422).json({message:'Funcionario não encontrado'})
      }

      const funRep = await FunRep.findOne({where:{FuncionarioId:funcionario.id,RepPId:repid}})
      if (!funRep){
        return res.status(422).json({message:'Funcionario não cadastrado nesse Rep-p'})
      }

      const rep = await Rep.findByPk(repid)
      if (!rep){
        return res.status(422).json({message:'Rep-P não encontrado'})
      }

      if (!rep.ativo){
        return res.status(422).json({message:'Rep-P não está ativo'})
      }

      if (rep.EmpresaId != empresa.id ){
        return res.status(401).json({message:'Acesso Negado! Rep não pertence a sua empesa'})
      }

      let ultimaMarc = await Marcacao.findOne({
        attributes: [[sequelize.fn('max', sequelize.col('nsr')), 'nsr']],
        where:{RepPId:rep.id},
      }) 

      if (ultimaMarc.nsr == null){
        ultimaMarc.nsr = 1;
      }else{ultimaMarc.nsr++}

      let hashAnterior
      if (ultimaMarc.tipoRegistro == 7)
      {
        hashAnterior = ultimaMarc.crc16_sha256
      }else{hashAnterior = ''}

      const dateFull = new Date(); 

      const dia = dateFull.getDate().toString().padStart(2, '0');
      const mes = (dateFull.getMonth() + 1).toString().padStart(2, '0');
      const ano = dateFull.getFullYear().toString();
      const date = `${mes}/${dia}/${ano}`;

      const hora = dateFull.toLocaleString().split(' ')[1];

                                                                //online mas offline 
      let codigoHash = ultimaMarc.nsr+tipoRegistro+date+hora+cpf+date+hora+tipoOperacao+online+hashAnterior
      codigoHash = hash_sha256(codigoHash)
      const marc = await Marcacao.create({data:date,hora:hora,nsr:ultimaMarc.nsr,cpf:cpf,cnpj:rep.cnpj_cpf_emp,
        local:rep.local,inpi_codigo:'const inpi',RepPId:rep.id,FuncionarioId:funcionario.id,
        tipoRegistro:tipoRegistro,tipoOperacao:tipoOperacao,online:online,crc16_sha256:codigoHash})
        
      marc.save();
      res.status(200).json('Marcação inserida')
      sendMail(funcionario,marc,date);
      if (funcionario.celular != undefined)
      {sendZap(funcionario,marc,date);}
    }catch(err){
      res.status(500).json(err.message)
    }

  }

  static async registraPIS(req,res){
    const pis = req.params.pis
    const repid = req.params.id

    const token = getToken(req)
    const empresa = await getUserByToken(token) 
    const online = 0 //rep-p Informar "0" para marcaçãoon-lineou "1" para marcaçãooff-line.
    const tipoRegistro = 7
    const tipoOperacao = req.get('tipoOperacao') //rep-p "01": aplicativomobile; "02":browser(navegador internet); "03": aplicativodesktop; "04": dispositivo eletrônico; "05": outro dispositivo eletrônico não especificado acima.
    
    if (!pis){
      return res.status(422).json({message:'O PIS é obrigatório'})
    }

    if (!repid){
      return res.status(422).json({message:'O ID do Rep-P é obrigatório'})
    }

    try{
      const funcionario = await Funcionario.findOne({where:{pis:pis,EmpresaId:empresa.id}})
      if (!funcionario){
        return res.status(422).json({message:'Funcionario não encontrado'}) 
      }

      const funRep = await FunRep.findOne({where:{FuncionarioId:funcionario.id,RepPId:repid}})
      if (!funRep){
        return res.status(422).json({message:'Funcionario não cadastrado nesse Rep-p'})
      }

      const rep = await Rep.findByPk(repid)
      if (!rep){
        return res.status(422).json({message:'Rep-P não encontrado'})
      }

      if (!rep.ativo){
        return res.status(422).json({message:'Rep-P não está ativo'})
      }

      if (rep.EmpresaId != empresa.id ){
        return res.status(401).json({message:'Acesso Negado! Rep não pertence a sua empresa'})
      }
      
      let ultimaMarc = await Marcacao.findOne({
        attributes: [[sequelize.fn('max', sequelize.col('nsr')), 'nsr']],
        where:{RepPId:rep.id},
      }) 

      if (ultimaMarc.nsr == null){
        ultimaMarc.nsr = 1;
      }else{ultimaMarc.nsr++}

      let hashAnterior
      if (ultimaMarc.tipoRegistro == 7)
      {
        hashAnterior = ultimaMarc.crc16_sha256
      }else{hashAnterior = ''}
      
      const dateFull = new Date(); 
      
      const dia = dateFull.getDate().toString().padStart(2, '0');
      const mes = (dateFull.getMonth() + 1).toString().padStart(2, '0');
      const ano = dateFull.getFullYear().toString();
      const date = `${mes}/${dia}/${ano}`;

      const hora = dateFull.toLocaleString().split(' ')[1];

      let codigoHash = ultimaMarc.nsr+tipoRegistro+date+hora+funcionario.cpf+date+hora+tipoOperacao+online+hashAnterior
      codigoHash = hash_sha256(codigoHash)
      const marc = await Marcacao.create({data:date,hora:hora,nsr:ultimaMarc.nsr,cpf:funcionario.cpf,cnpj:rep.cnpj_cpf_emp,
        local:rep.local,inpi_codigo:'const inpi',RepPId:rep.id,FuncionarioId:funcionario.id,
        tipoRegistro:tipoRegistro,tipoOperacao:tipoOperacao,online:online,crc16_sha256:codigoHash})
         
      marc.save();
      res.status(200).json('Marcação inserida')
      sendMail(funcionario,marc,date);
      if (funcionario.celular != undefined)
      { 
         console.log(funcionario.celular);
         sendZap(funcionario,marc,date);
      }
    }catch(err){
      res.status(500).json(err.message)
    }
  }      

  static async recolheMarc(req,res){
    const nsr = req.params.nsr
    const page = parseInt(req.query.page || 1)
    const limit = req.query.limit || 100
    const salto = (page - 1)*limit;
    if (!nsr){
      nsr = 1
    }
    const repid = req.params.idrep

    const token = getToken(req)
    const empresa = await getUserByToken(token) 

    const rep = await Rep.findByPk(repid)
    if (!rep){
      res.status(422).json({message:'Rep-P não encontrado'})
    }

    if (!rep.ativo){
      res.status(422).json({message:'Rep-P não está ativo'})
    }

    if (rep.EmpresaId != empresa.id ){
      return res.status(401).json({message:'Acesso Negado! Rep não pertence a sua empesa'})
    }

    try{
     
      const { count, rows } = await Marcacao.findAndCountAll({limit: limit, offset: salto, where:{RepPId:repid,tipoRegistro:7,nsr:{[Op.gte]:nsr}}
        , order: [
          ['id', 'ASC'],
        ],
        attributes: ["nsr", "cpf", "data", "hora", "cnpj", "inpi_codigo" ]
      })

      const totPage = Math.ceil(count/limit)
      res.status(200).json({pagina:page,totalPaginas:totPage, marcacoes:rows})

    }catch(err){
      res.status(500).json(err.message)
    }
  }

  static async marcacaoFunc(req,res){
    const cpf = req.params.cpf
    //const repid = req.params.idrep

    const token = getToken(req)
    const empresa = await getUserByToken(token) 

    try{
      const dataAtual = new Date();
      const dataFormatada = dataAtual.toISOString().split('T')[0];
      const rows = await Marcacao.findAll({ where:{tipoRegistro:7,cpf:cpf,data:dataFormatada}
        , order: [
          ['id', 'ASC'],
        ],
        attributes: ["nsr", "cpf", "data", "hora", "cnpj", "inpi_codigo" ]
      })

      res.status(200).json({marcacoes:rows})

    }catch(err){
      res.status(500).json(err.message)
    }
  }

}    