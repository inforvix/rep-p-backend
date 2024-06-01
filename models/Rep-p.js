const {DataTypes} = require('sequelize')
const db  = require("../db/conn")
const Empresa = require('./Empresa')
const Funcionario = require('./Funcionario')

const RepP = db.define('RepP',{
    cnpj_cpf_emp: {type: DataTypes.STRING,
      required: true,},
    local: {type: DataTypes.STRING,
      required: false,},  
    nome_rep: {type: DataTypes.STRING,
      required: false,},  
    inpi_codigo: {type: DataTypes.STRING,
      required: true,},  
    razao: {type: DataTypes.STRING,
      required: false,},  
    ativo: {type: DataTypes.BOOLEAN,} 
  },{
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  })
  
  RepP.belongsTo(Empresa,{ foreignKey: { allowNull: false }, onDelete: 'CASCADE' })


  module.exports = RepP;