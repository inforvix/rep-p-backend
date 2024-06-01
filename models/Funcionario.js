const { DataTypes } = require('sequelize')
const db = require("../db/conn")
const Empresa = require('./Empresa')

const Funcionario = db.define('Funcionario', {
  nome: {
    type: DataTypes.STRING,
    required: true,
  },
  pis: {
    type: DataTypes.STRING,
    required: true,
  },
  cpf: {
    type: DataTypes.STRING,
    required: true,
  },
  email: {
    type: DataTypes.STRING,
    required: true,
  },
  celular: {
    type: DataTypes.STRING,
    required: false,
  },
  senha: { type: DataTypes.STRING, },
  ativo: { type: DataTypes.BOOLEAN, }
}, {
  timestamps: false,
  createdAt: false,
  updatedAt: false,
})

Funcionario.belongsTo(Empresa, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })


module.exports = Funcionario;