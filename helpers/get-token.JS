const getToken = (req,res) =>{
  if (!req.headers.authorization){
    return res.status(401).json({message:'Acesso Negado!'})
  }
  const authHeader = req.headers.authorization
  const token = authHeader.split(' ')[1]
  return token
}
module.exports = getToken