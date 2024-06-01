const {DataTypes} = require('sequelize')
const db  = require("../db/conn")

const RepP = require('./Rep-p')
const Funcionario = require('./Funcionario')

const FuncionarioRep = db.define('funcionario_rep',{},{
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  });  
//"FuncionarioId" INTEGER NOT NULL,
//"RepPId" INTEGER NOT NULL,
Funcionario.belongsToMany(RepP,{through: 'funcionario_rep'})//foreignKey: { allowNull: false }, onDelete: 'CASCADE',
RepP.belongsToMany(Funcionario,{through: 'funcionario_rep'})

module.exports = FuncionarioRep;