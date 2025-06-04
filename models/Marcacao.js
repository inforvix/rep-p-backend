const { DataTypes } = require('sequelize')
const db = require("../db/conn")

const Funcionario = require('./Funcionario')
const RepP = require('./Rep-p')

const Marcacao = db.define('Marcacao', {
  data: {
    type: DataTypes.DATE,
    required: true,
  },
  hora: {
    type: DataTypes.TIME,
    required: true,
  },
  nsr: {
    type: DataTypes.BIGINT,
    required: true,
  },
  cpf: {
    type: DataTypes.STRING,
    required: true,
  },
  cnpj: {
    type: DataTypes.STRING,
    required: true,
  },
  local: {
    type: DataTypes.STRING,
    required: false,
  },
  inpi_codigo: {
    type: DataTypes.STRING,
    required: true,
  },
  caminho_comprovante: {
    type: DataTypes.STRING,
    required: false,
  },
  RepPId: {
    type: DataTypes.INTEGER,
    require: true
  },
  tipoRegistro: {
    type: DataTypes.INTEGER,//rep-p 7
    require: true
  },
  tipoOperacao: {
    type: DataTypes.STRING,//rep-p "01": aplicativomobile; "02":browser(navegador internet); "03": aplicativodesktop; "04": dispositivo eletrônico; "05": outro dispositivo eletrônico não especificado acima.
    require: false
  },
  online: {
    type: DataTypes.INTEGER,//rep-p Informar "0" para marcaçãoon-lineou "1" para marcaçãooff-line.
    required: false,
  },
  razao: {
    type: DataTypes.STRING,
    required: false,
  },
  nome: {
    type: DataTypes.STRING,
    required: false,
  },
  cpfResponsavel: {
    type: DataTypes.STRING,
    required: false,
  },
  crc16_sha256: {
    type: DataTypes.STRING,//rep-p Códigohash.
    required: true,
  },
    latitude: {
    type: DataTypes.STRING,//rep-p Códigohash.
    required: true,
  },
    longitude: {
    type: DataTypes.STRING,//rep-p Códigohash.
    required: true,
  },
}, {
  updatedAt: false,
  useUTC: false,
  indexes: [{
    unique: true,
    fields: ['nsr', 'RepPId']
  }
  ]
})

Marcacao.belongsTo(Funcionario, { foreignKey: { allowNull: true }, onDelete: 'CASCADE' })
Funcionario.hasOne(Marcacao)
Marcacao.belongsTo(RepP, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
RepP.hasOne(Marcacao) // para poder usar rep.getMarcacao();

module.exports = Marcacao;