const sequelize = require("sequelize");
const { Op } = require("sequelize");

const getToken = require("../helpers/get-token");

const Funcionario = require("../models/Funcionario");
const Empresa = require("../models/Empresa");
const MarcacaoSolicitada = require("../models/Marcacao-Solicitada");

module.exports = class MarcacaoController {
  static async solicitarMarcacao(req, res) {
    const cpf = req.user.fun_cpf;
    const empresa = await Empresa.findOne({ where: { id:  req.user.fun_empresa } });

    const { data, hora, observacao } = req.body;

    if (!data) {
      return res.status(422).json({ message: "A data é obrigatória" });
    }

    if (!hora) {
      return res.status(422).json({ message: "A hora é obrigatória" });
    }

    if (!observacao) {
      return res.status(422).json({ message: "A observação é obrigatória" });
    }

    try {
      const funcionario = await Funcionario.findOne({ where: { cpf: cpf } });
      if (!funcionario) {
        return res.status(422).json({ message: "Funcionario não encontrado" });
      }

      const marc = await MarcacaoSolicitada.create({
        data: data,
        hora: hora,
        cpf: funcionario.cpf,
        cnpj: empresa.cnpj,
        observacao: observacao,
        FuncionarioId: funcionario.id,
      });

      res.status(200).json("Marcação Solicitada com Sucesso!");
     
     
    } catch (err) {
      res.status(500).json(err.message);
    }
  }
};
