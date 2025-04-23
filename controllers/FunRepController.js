const sequelize = require('sequelize')

const FunRep = require('../models/FuncionarioRep')
const Rep = require('../models/Rep-p')
const Funcionario = require('../models/Funcionario')
const Marcacao = require('../models/Marcacao')
const Operador = require('../models/Operador')
const validaCPF = require('../helpers/validar-cpf')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const crc_16 = require('../helpers/create-crc-16')

module.exports = class FunRepController{

    static async cadastrar(req,res){

        const token = getToken(req)
        const empresa = await getUserByToken(token)    
       
        const {cpf,pis,repid} = req.body
        let cpfResponsavel = req.get('cpfResponsavel')
        
        if (!cpfResponsavel){
          return res.status(422).json({message:'Para enviar um funcionário ao REP, a portaria 671 requer um CPF do responsavel!'})
        }

        if (!validaCPF(cpfResponsavel)){
          return res.status(422).json({message:'CPF inválido'})
        }else{cpfResponsavel = cpfResponsavel.replace(/[^\d]+/g,'');}

        const Ope = await Operador.findOne({ where: { EmpresaId: empresa.id, cpf: cpfResponsavel } })

        if (!Ope){
          return res.status(422).json({message:'CPF do Operador não encontrada, cadastre-o antes de fazer operações'}) 
        }

        if (!empresa){
          return res.status(401).json({message:'Acesso Negado!'})
        }
        
        if (!repid){
          return res.status(422).json({message:'O codigo do Rep-P é obrigatório'})
        }

        if (!pis && !cpf){
          return res.status(422).json({message:'O CPF ou o PIS deve ser enviado'})
        }

        const rep = await Rep.findByPk(repid)
        
        if (!rep){
          return res.status(422).json({message:'Rep-P não encontrado'})
        }
        if (!rep.ativo){return res.status(422).json({message:'O Rep-p não está ativo'})}

        if (rep.EmpresaId != empresa.id){
          return res.status(401).json({message:'Este Rep-P não pertene a sua empresa!'})
        }
        
        let fun
        if (pis){
          fun = await Funcionario.findOne({where: { EmpresaId: empresa.id, pis:pis }})
          if (!fun){return res.status(422).json({message:'O funcionário não foi encontrado'})}
          if (!fun.ativo){return res.status(422).json({message:'O funcionário não está ativo'})}
        }else
        if (cpf){
          fun = await Funcionario.findOne({where: { EmpresaId: empresa.id, cpf:cpf }})
          if (!fun){return res.status(422).json({message:'O funcionário não foi encontrado'})}
          if (!fun.ativo){return res.status(422).json({message:'O funcionário não está ativo'})}
        } 

        const existe = await FunRep.findOne({where:{FuncionarioId:fun.id,RepPId:rep.id}})

        if (existe){return res.status(422).json({message:'O funcinario já está cadastrado'})}

        try{
          const funRep = await FunRep.create({FuncionarioId:fun.id,RepPId:rep.id})//empresaid:EmpresaId,
          await funRep.save()

          let ultimaMarc = await Marcacao.findOne({
            attributes: [[sequelize.fn('max', sequelize.col('nsr')), 'nsr']],
            where:{RepPId:rep.id},
          }) 
          
          if (ultimaMarc.nsr == null){
            ultimaMarc.nsr = 1;
          }else{ultimaMarc.nsr++}
          const tipoRegistro = 5

          var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
          var date = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

          let codigoCrc = ultimaMarc.nsr + tipoRegistro + date + cpfResponsavel + 'I' + fun.cpf + fun.nome 
          codigoCrc = crc_16(codigoCrc)
          
          const marc = await Marcacao.create({nsr:ultimaMarc.nsr,inpi_codigo:'BR 51 2025 001324-8',cpfResponsavel:cpfResponsavel,FuncionarioId:fun.id,
          RepPId:rep.id, cpf:fun.cpf, nome:fun.nome, tipoRegistro:tipoRegistro,tipoOperacao:'I',crc16_sha256:codigoCrc})


          res.status(200).json({message:'Funcionário '+fun.nome+' cadastrado no Rep-P'})
        }catch(err){
          res.status(500).json(err.message)
        }
    }
    
    static async editar(req,res){}

    static async dell(req,res){
        const token = getToken(req)
        const empresa = await getUserByToken(token)    
       
        const {cpf,pis,repid} = req.body
        const cpfResponsavel = req.get('cpfResponsavel')
        
        if (!cpfResponsavel){
          return res.status(422).json({message:'Para enviar um funcionário ao REP, a portaria 671 requer um CPF do responsavel!'})
        }

        if (!validaCPF(cpfResponsavel)){
          return res.status(422).json({message:'CPF inválido'})
        }else{cpfResponsavel = cpfResponsavel.replace(/[^\d]+/g,'');}

        const Ope = await Operador.findOne({ where: { EmpresaId: empresa.id, cpf: cpfResponsavel } })

        if (!Ope){
          return res.status(422).json({message:'CPF do Operador não encontrada, cadastre-o antes de fazer operações'}) 
        }

        if (!validaCPF(cpfResponsavel)){
          return res.status(422).json({message:'CPF inválido'})
        }else{cpfResponsavel = cpfResponsavel.replace(/[^\d]+/g,'');}

        if (!Ope){
          return res.status(422).json({message:'CPF do Operador não encontrada, cadastre-o antes de fazer operações'}) 
        }

        if (!empresa){
          return res.status(401).json({message:'Acesso Negado!'})
        }
        
        if (!repid){
          return res.status(422).json({message:'O codigo do Rep-P é obrigatório'})
        }

        if (!pis && !cpf){
          return res.status(422).json({message:'O CPF ou o PIS deve ser enviado'})
        }

        const rep = await Rep.findByPk(repid)
        
        if (!rep){
          return res.status(422).json({message:'Rep-P não encontrado'})
        }


        if (rep.EmpresaId != empresa.id){
          return res.status(401).json({message:'Este Rep-P não pertene a sua empresa!'})
        }
        
        let fun
        if (pis){
          fun = await Funcionario.findOne({where: { EmpresaId: empresa.id, pis:pis }})
          if (!fun){return res.status(422).json({message:'O funcionário não foi encontrado'})}

        }else
        if (cpf){
          fun = await Funcionario.findOne({where: { EmpresaId: empresa.id, cpf:cpf }})
          if (!fun){return res.status(422).json({message:'O funcionário não foi encontrado'})}

        } 

        
        try{
          const existe = await FunRep.findOne({FuncionarioId:fun.id,RepPId:rep.id})
          if (!existe){return res.status(422).json({message:'O funcinario não está cadastrado nesse Rep-P'})}
          await existe.destroy()
          
          let ultimaMarc = await Marcacao.findOne({
            attributes: [[sequelize.fn('max', sequelize.col('nsr')), 'nsr']],
            where:{RepPId:rep.id},
          }) 
          
          if (ultimaMarc.nsr == null){
            ultimaMarc.nsr = 1;
          }else{ultimaMarc.nsr++}
          const tipoRegistro = 5

          var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
          var date = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

          let codigoCrc = ultimaMarc.nsr + tipoRegistro + date + cpfResponsavel + 'E' + fun.cpf + fun.nome 
          codigoCrc = crc_16(codigoCrc)
          
          const marc = await Marcacao.create({nsr:ultimaMarc.nsr,inpi_codigo:'const inpi',cpfResponsavel:cpfResponsavel,FuncionarioId:fun.id,
          RepPId:rep.id, cpf:fun.cpf, nome:fun.nome, tipoRegistro:tipoRegistro,tipoOperacao:'E',crc16_sha256:codigoCrc})
          
          res.status(200).json({message:'Funcionário '+fun.nome+' apagado no Rep-P'})
        }catch(err){
          res.status(500).json(err.message)
        }
    
    }

}                                                        