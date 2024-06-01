const jwt = require('jsonwebtoken')
const Empresa = require('../models/Empresa')

const getUserByToken = async (token) => {
    if (!token){return res.status(401).json({message:'Acesso Negado!'})}

    const decoded = jwt.verify(token, 'ASc3hTKprW#4gH06S746&HN%#')
    const empId = decoded.id
    const empresa = await Empresa.findByPk(empId)
    return empresa
}

module.exports = getUserByToken