const {DataTypes} = require('sequelize')
const db  = require("../db/conn")
const Empresa = require('./Empresa')

const Operador = db.define('Operador',{
    nome: {type: DataTypes.STRING,
      required: true,}, 
    cpf: {type: DataTypes.STRING,
      required: true,},  
    ativo: {type: DataTypes.BOOLEAN,} 
  },{
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  })
  
  Operador.belongsTo(Empresa,{ foreignKey: { allowNull: false }, onDelete: 'CASCADE' })


  module.exports = Operador;