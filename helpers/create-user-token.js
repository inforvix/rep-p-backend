const jwt = require('jsonwebtoken')

const createUserToken = async(emp,req,res)=> {
  const token = jwt.sign({
    name: emp.fantasia,
    id: emp.id
  }, "ASc3hTKprW#4gH06S746&HN%#")

  res.status(200).json({
    message:"Você está autenticado",
    token: token,
    userid:emp.id,
    paramsenhafunc: emp.solicitasenhafunc,
  })

}

module.exports = createUserToken