const { DataTypes } = require('sequelize')
const db = require("../db/conn")

const Empresa = db.define('Empresa', {
  cnpj: {
    type: DataTypes.STRING,
    required: true,
  },
  contrato: {
    type: DataTypes.STRING,
    required: true,
  },
  login: {
    type: DataTypes.STRING,
    required: true,
  },
  senha: {
    type: DataTypes.STRING,
    required: true,
  },
  razao: {
    type: DataTypes.STRING,
    required: true,
  },
  fantasia: {
    type: DataTypes.STRING,
    required: true,
  },
  email: {
    type: DataTypes.STRING,
    required: true,
  },
  solicitasenhafunc: {
    type: DataTypes.BOOLEAN,
    required: true,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
  },
  solicita_foto_registrar_marcacao: {
    type: DataTypes.BOOLEAN,
    required: false,
  },
}, {
  timestamps: false,
  createdAt: false,
  updatedAt: false,
})

module.exports = Empresa;