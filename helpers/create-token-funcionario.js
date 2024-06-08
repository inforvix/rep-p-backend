const jwt = require('jsonwebtoken')

const createUserTokenFuncionario = async(funcionario,req,res)=> {
  const token = jwt.sign({
    fun_cpf: funcionario.cpf,
    fun_empresa: funcionario.EmpresaId,
    fun_rep_padrao: funcionario.rep_padrao
  }, "ASc3hTKprW#4gH06S746&HN%#")

  //console.log(fun_cpf)
  console.log(funcionario.EmpresaId)

  res.status(200).json({
    message:"Você está autenticado",
    token: token,
    empresa:funcionario.EmpresaId
  })

}

module.exports = createUserTokenFuncionario