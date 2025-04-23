const Operador = require('../models/Operador')

const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const validaCPF = require('../helpers/validar-cpf')

module.exports = class OperadorController{


  static async getOperadorByCPF(req, res) {
    const token = getToken(req);
    const empresa = await getUserByToken(token);

    const cpf = req.params.cpf;

    try {
      const operador = await Operador.findOne({
        where: { cpf: cpf, EmpresaId: empresa.id },
      });
      if (!operador) {
        res.status(422).json({ message: "Funcionaio não encontrado" });
      }
      res.status(200).json(funcionario);
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

    static async cadastrar(req,res){

        const token = getToken(req)
        const empresa = await getUserByToken(token)    
       
        let {nome,cpf,ativo} = req.body

        if (!empresa){
          return res.status(401).json({message:'Acesso Negado!'})
        }
        
        if (!cpf){
            res.status(422).json({message:'CPF é obrigatório'})
            return
        }

        if (!nome){
            res.status(422).json({message:'Nome é obrigatório'})
            return
        }
          
        if(ativo == undefined)
          {ativo = true}

        if (!validaCPF(cpf)){
            return res.status(422).json({message:'CPF inválido'})
        }else
        {
            cpf = cpf.replace(/[^\d]+/g,'')
        }
             
        const existe = await Operador.findOne({where:{cpf:cpf,EmpresaId:empresa.id}})

        if (existe){return res.status(200).json({message:'O Operador já está cadastrado com esse CPF'})}

        try{
          const funRep = await Operador.create({nome:nome,cpf:cpf,EmpresaId:empresa.id,ativo:ativo})//empresaid:EmpresaId,
          await funRep.save()
          res.status(200).json({message:'Operador '+nome+' cadastrado '})
        }catch(err){
          res.status(500).json(err.message)
        }
    }
}