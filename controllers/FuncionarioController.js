const sequelize = require("sequelize");

const bcrypt = require("bcrypt");
const Funcionario = require("../models/Funcionario");
const FunRep = require("../models/FuncionarioRep");
const Operador = require("../models/Operador");
const Marcacao = require("../models/Marcacao");

const createUserTokenFuncionario = require("../helpers/create-token-funcionario");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const validaEmail = require("../helpers/valida-email");
const validaCelular = require("../helpers/validar-celular");
const validaCPF = require("../helpers/validar-cpf");
const crc_16 = require("../helpers/create-crc-16");

module.exports = class FuncionarioController {

  static async loginFuncionario(req, res) {
    const { cpf, senha } = req.body;

    if (!senha) {
      res.status(422).json({ message: "Senha é obrigatório" });
      return;
    }
    if (!cpf) {
      res.status(422).json({ message: "login é obrigatório" });
      return;
    }

    const funcionarioLogin = await Funcionario.findOne({ where: { cpf: cpf } });
    if (!funcionarioLogin) {
      res.status(422).json({ message: "Esse login não existe" });
      return;
    }

    const checkPassword = await bcrypt.compare(senha, funcionarioLogin.senha);
    if (!checkPassword) {
      res.status(422).json({ message: "Senha Inválida" });
      return;
    }

    if (!funcionarioLogin.ativo && funcionarioLogin.id != 1) {
      return res.status(422).json({ message: "Funcionario desativado" });
    }

    try {
      await createUserTokenFuncionario(funcionarioLogin, req, res);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }


  static async cadastrar(req, res) {
    const token = getToken(req);
    const empresa = await getUserByToken(token);
    const empresaid = empresa.id;

    let { cpf } = req.body;
    const { nome, pis, email, senha, ativo, celular, rep_padrao } = req.body;

    if (!nome) {
      res.status(422).json({ message: "Nome é obrigatório" });
      return;
    }
    if (!pis) {
      res.status(422).json({ message: "PIS é obrigatório" });
      return;
    }
    if (!cpf) {
      res.status(422).json({ message: "CPF é obrigatório" });
      return;
    }

    if (!validaCPF(cpf)) {
      return res.status(422).json({ message: "CPF inválido" });
    } else {
      cpf = cpf.replace(/[^\d]+/g, "");
    }

    if (!email) {
      res.status(422).json({ message: "e-Mail é obrigatório" });
      return;
    }

    if (!validaEmail(email)) {
      return res.status(422).json({ message: "e-Mail inválido" });
    }

    if (celular != undefined) {
      if (!validaCelular(celular)) {
        return res.status(422).json({ message: "Celular inválido" });
      }
    }

    if (!empresaid) {
      res.status(422).json({ message: "Empresa é obrigatório" });
      return;
    }

    const pisExiste = await Funcionario.findOne({
      where: { pis: pis, EmpresaId: empresaid },
    });
    if (pisExiste) {
      res
        .status(422)
        .json({ message: "já existe um funcionário com esse PIS", pis });
      return;
    }

    const cpfExiste = await Funcionario.findOne({
      where: { cpf: cpf, EmpresaId: empresaid },
    });
    if (cpfExiste) {
      res
        .status(422)
        .json({ message: "Já existe um funcionário com esse CPF", cpf });
      return;
    }

    const emailExiste = await Funcionario.findOne({ where: { email: email } });
    if (emailExiste) {
      emailExiste.senha = undefined;
      res
        .status(422)
        .json({ message: "Este e-mail já está sendo utilizado", emailExiste });
      return;
    }

    if (celular != null) {
      const celularExiste = await Funcionario.findOne({
        where: { celular: celular },
      });
      if (celularExiste) {
        celularExiste.senha = undefined;
        res
          .status(422)
          .json({
            message: "Este celular já está sendo utilizado",
            celularExiste,
          });
        return;
      }
    }
    var passwordHash = "";
    if (senha != null) {
      const salt = await bcrypt.genSalt(12);
      passwordHash = await bcrypt.hash(senha, salt);
    } else {
      passwordHash = "semsenha";
    }

    console.log("Criando funcionario");
    try {
      const newFunc = await Funcionario.create({
        nome: nome,
        pis: pis,
        cpf: cpf,
        email: email,
        senha: passwordHash,
        EmpresaId: empresaid,
        celular: celular,
        ativo: true,
        rep_padrao: rep_padrao,
      }); //empresaid:EmpresaId,

      await newFunc.save();
      res.status(200).json({ message: "Funcionario cadastrado", nome });
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async getFunByCPF(req, res) {
    const token = getToken(req);
    const empresa = await getUserByToken(token);

    const cpf = req.params.cpf;

    try {
      const funcionario = await Funcionario.findOne({
        where: { cpf: cpf, EmpresaId: empresa.id },
      });
      if (!funcionario) {
        res.status(422).json({ message: "Funcionaio não encontrado" });
      }
      funcionario.senha = undefined;
      res.status(200).json(funcionario);
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async getFunByPIS(req, res) {
    const token = getToken(req);
    const empresa = await getUserByToken(token);

    const pis = req.params.pis;

    try {
      const funcionario = await Funcionario.findOne({
        where: { pis: pis, EmpresaId: empresa.id },
      });
      if (!funcionario) {
        res.status(422).json({ message: "Funcionaio não encontrado" });
      }
      funcionario.senha = undefined;
      res.status(200).json(funcionario);
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async showAllFuncionarios(req, res) {
    const token = getToken(req);
    const empresa = await getUserByToken(token);

    try {
      const funcionario = await Funcionario.findAll({
        attributes: { exclude: ["senha"] },
        where: { EmpresaId: empresa.id },
      });
      res.status(200).json(funcionario);
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async funDel(req, res) {
    const token = getToken(req);
    const empresa = await getUserByToken(token);
    const cpfPai = req.params.cpf;

    const funcionario = await Funcionario.findOne({
      where: { cpf: cpfPai, EmpresaId: empresa.id },
    });

    if (!funcionario) {
      return res.status(422).json({ message: "Funcionaio não encontrado" });
    }
    const marcacoes = await funcionario.getMarcacao();
    if (marcacoes) {
      return res
        .status(422)
        .json({
          message:
            "Este funcionario já possui marcações e não pode ser excluido",
        });
    }

    try {
      funcionario.destroy();
      return res.status(200).json({ message: "Funcionaio Apagado!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async editFun(req, res) {
    const token = getToken(req);
    const empresa = await getUserByToken(token);

    let cpfResponsavel = req.get("cpfResponsavel");

    if (!cpfResponsavel) {
      return res
        .status(422)
        .json({
          message:
            "Para enviar informações pro REP, a portaria 671 requer um CPF do responsavel!",
        });
    }

    const Ope = await Operador.findOne({
      where: { EmpresaId: empresa.id, cpf: cpfResponsavel },
    });

    if (!Ope) {
      return res
        .status(422)
        .json({
          message:
            "CPF do Operador não encontrada, cadastre-o antes de fazer operações",
        });
    }
    if (!empresa) {
      return res.status(422).json({ message: "Empresa não encontrada" });
    }

    const cpfPai = req.params.cpf;

    const funcionario = await Funcionario.findOne({
      where: { cpf: cpfPai, EmpresaId: empresa.id },
    });
    if (!funcionario) {
      return res.status(422).json({ message: "Funcionaio não encontrado" });
    }

    let { cpf } = req.body;
    const { nome, pis, email, senha, ativo, celular } = req.body;

    if (nome) {
      funcionario.nome = nome;
    }

    if (pis && pis !== funcionario.pis) {
      const pisExiste = await Funcionario.findOne({
        where: { pis: pis, EmpresaId: empresa.id },
      });
      if (pisExiste) {
        return res
          .status(422)
          .json({ message: "já existe um funcionário com esse PIS", pis });
      }
    }
    funcionario.pis = pis;

    if (cpf && cpf !== funcionario.cpf) {
      const cpfExiste = await Funcionario.findOne({
        where: { cpf: cpf, EmpresaId: empresa.id },
      });
      if (cpfExiste) {
        return res
          .status(422)
          .json({ message: "Já existe um funcionário com esse CPF", cpf });
      }
    }

    if (!validaCPF(cpf)) {
      return res.status(422).json({ message: "CPF inválido" });
    } else {
      cpf = cpf.replace(/[^\d]+/g, "");
    }

    funcionario.cpf = cpf;

    if (email && email !== funcionario.email) {
      const emailExiste = await Funcionario.findOne({
        where: { email: email },
      });
      if (emailExiste) {
        emailExiste.senha = undefined;
        return res
          .status(422)
          .json({
            message: "Este e-mail já está sendo utilizado",
            emailExiste,
          });
      }
    }

    if (!validaEmail(email)) {
      return res.status(422).json({ message: "e-mail inválido" });
    }

    funcionario.email = email;

    if (celular && celular !== funcionario.celular) {
      const celularExiste = await Funcionario.findOne({
        where: { celular: celular },
      });
      if (celularExiste) {
        celularExiste.senha = undefined;
        return res
          .status(422)
          .json({
            message: "Este celular já está sendo utilizado",
            emailExiste,
          });
      }
    }

    if (!validaCelular(celular)) {
      return res.status(422).json({ message: "Celular inválido" });
    }

    funcionario.celular = celular;

    if (ativo != undefined) {
      funcionario.ativo = ativo;
    }

    var passwordHash = "";
    if (senha != null) {
      const salt = await bcrypt.genSalt(12);
      passwordHash = await bcrypt.hash(senha, salt);
      funcionario.senha = passwordHash;
    }

    try {
      funcionario.save();
      const tipoRegistro = 5;
      var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
      var date = new Date(Date.now() - tzoffset).toISOString().slice(0, -1);
      const funcRep = await FunRep.findAll({
        where: { FuncionarioId: funcionario.id },
      });

      for (const key in funcRep) {
        let ultimaMarc = await Marcacao.findOne({
          attributes: [[sequelize.fn("max", sequelize.col("nsr")), "nsr"]],
          where: { RepPId: funcRep[key].RepPId },
        });

        if (ultimaMarc.nsr == null) {
          ultimaMarc.nsr = 1;
        } else {
          ultimaMarc.nsr++;
        }

        let codigoCrc =
          ultimaMarc.nsr +
          tipoRegistro +
          date +
          cpfResponsavel +
          "A" +
          funcionario.cpf +
          funcionario.nome;
        codigoCrc = crc_16(codigoCrc);

        const marc = await Marcacao.create({
          nsr: ultimaMarc.nsr,
          inpi_codigo: "const inpi",
          cpfResponsavel: cpfResponsavel,
          FuncionarioId: funcionario.id,
          RepPId: funcRep[key].RepPId,
          cpf: funcionario.cpf,
          nome: funcionario.nome,
          tipoRegistro: tipoRegistro,
          tipoOperacao: "A",
          crc16_sha256: codigoCrc,
        });
      }

      res.status(200).json({ message: "Funcionario Alterado!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
