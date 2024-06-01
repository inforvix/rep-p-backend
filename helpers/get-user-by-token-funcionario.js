const jwt = require('jsonwebtoken')
const Funcionario = require('../models/Funcionario')

const getUserByTokenFuncionario = async (token) => {
    if (!token){return res.status(401).json({message:'Acesso Negado!'})}
    const decoded = jwt.verify(token, 'ASc3hTKprW#4gH06S746&HN%#')
    const funcionarioId = decoded.id
    return Funcionario.findByPk(funcionarioId)
}

module.exports = getUserByTokenFuncionario