const { DataTypes } = require('sequelize')
const db = require("../db/conn")
const Funcionario = require('./Funcionario')

const MarcacaoSolicitada = db.define('MarcacaoSolicitada', {
  data: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cnpj: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  observacao: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
}, {
  updatedAt: false,
  createdAt: true, // Armazena automaticamente a data de criação
  useUTC: false,
  tableName: 'Marcacoes_solicitadas', // Nome da tabela no banco
  indexes: [{
    fields: ['FuncionarioId'] // Índice para melhorar consultas por funcionário
  }]
})

// Relacionamentos
MarcacaoSolicitada.belongsTo(Funcionario, { 
  foreignKey: { 
    name: 'FuncionarioId',
    allowNull: false 
  }, 
  onDelete: 'CASCADE' 
})

Funcionario.hasMany(MarcacaoSolicitada, {
  foreignKey: 'FuncionarioId'
})

module.exports = MarcacaoSolicitada