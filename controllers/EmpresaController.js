//const { EmptyResultError } = require('sequelize')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Empresa = require("../models/Empresa");

const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const validaEmail = require("../helpers/valida-email");
const validaCNPJ = require("../helpers/validar-cnpj");

module.exports = class EmpresaController {
  static async cadastrar(req, res) {
    const token = getToken(req);
    const empresa = await getUserByToken(token)  

    if (empresa.id !== 1){
      return res.status(401).json({message:'Acesso Negado!'})
    }

    let { cnpj } = req.body;
    
    const { contrato, login, senha, razao, fantasia, email } = req.body;
    if (!cnpj) {
      res.status(422).json({ message: "CNPJ é obrigatório" });
      return;
    }

    if (!validaCNPJ(cnpj)) {
      return res.status(422).json({ message: "CNPJ inválido" });
    } else {
      cnpj = cnpj.replace(/[^\d]+/g, "");
    }

    if (!contrato) {
      res.status(422).json({ message: "Contrato é obrigatório" });
      return;
    }
    if (!login) {
      res.status(422).json({ message: "login é obrigatório" });
      return;
    }
    if (!razao) {
      res.status(422).json({ message: "Razão social é obrigatório" });
      return;
    }
    if (!fantasia) {
      res.status(422).json({ message: "Fantasia é obrigatório" });
      return;
    }
    if (!senha) {
      res.status(422).json({ message: "Senha é obrigatório" });
      return;
    }
    if (!email) {
      res.status(422).json({ message: "e-Mail é obrigatório" });
      return;
    }

    if (!validaEmail(email)) {
      return res.status(422).json({ message: "e-Mail inválido" });
    }

    //chegar se o e-mail exist
    const emailExiste = await Empresa.findOne({ where: { email: email } });
    if (emailExiste) {
      res.status(422).json({ message: "e-Mail já utilizado", email });
      return;
    }

    //chegar se o CNPJ exist
    const cnpjExiste = await Empresa.findOne({ where: { cnpj: cnpj } });
    if (cnpjExiste) {
      res.status(422).json({ message: "CNPJ já utilizado", cnpj });
      return;
    }

    //chegar se o contrato exist
    const contratoExiste = await Empresa.findOne({
      where: { contrato: contrato },
    });
    if (contratoExiste) {
      res.status(422).json({ message: "Contrato já utilizado", contrato });
      return;
    }

    const loginExiste = await Empresa.findOne({ where: { login: login } });
    if (loginExiste) {
      const loginExiste = await Empresa.findOne({ where: { login: login } });
      res.status(422).json({ message: "Login já utilizado", login });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(senha, salt);

    try {
      const newEmp = await Empresa.create({
        cnpj: cnpj,
        contrato: contrato,
        login: login,
        senha: passwordHash,
        razao: razao,
        fantasia: fantasia,
        email: email,
        ativo: true,
      });
      // newEmp.save();
      //res.status(201).json({message:'Empresa criada',newEmp})
      await createUserToken(newEmp, req, res);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async login(req, res) {
    const { login, senha } = req.body;

    if (!senha) {
      res.status(422).json({ message: "Senha é obrigatório" });
      return;
    }
    if (!login) {
      res.status(422).json({ message: "login é obrigatório" });
      return;
    }

    const empresaLogin = await Empresa.findOne({ where: { login: login } });
    if (!empresaLogin) {
      res.status(422).json({ message: "Esse login não existe" });
      return;
    }

    const checkPassword = await bcrypt.compare(senha, empresaLogin.senha);
    if (!checkPassword) {
      res.status(422).json({ message: "Senha Inválida" });
      return;
    }

    if (!empresaLogin.ativo && empresaLogin.id != 1) {
      return res.status(422).json({ message: "Empresa desativada" });
    }

    try {
      await createUserToken(empresaLogin, req, res);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async chechUserEmp(req, res) {
    const token = getToken(req);
    const emp = await getUserByToken(token);

    if (emp.id != 1) {
      return res.status(401).json({ message: "Acesso Negado!" });
    }

    let CurrentUser;

    try {
      if (req.headers.authorization) {
        const token = getToken(req);
        const decoded = jwt.verify(token, "ASc3hTKprW#4gH06S746&HN%#");

        CurrentUser = await Empresa.findByPk(decoded.id);
        CurrentUser.senha = undefined;
      } else CurrentUser = null;
      res.status(200).json(CurrentUser);
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async getEmpById(req, res) {
    const token = getToken(req);

    try {
      const id = req.params.id;
      const empresa = await Empresa.findByPk(id);
      if (!empresa) {
        res.status(422).json({ message: "Empresa não encontrada" });
      }
      empresa.senha = undefined;
      res.status(200).json(empresa);
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async getEmpByCNPJ(req, res) {
    const token = getToken(req);
    const emp = await getUserByToken(token);

    if (emp.id != 1) {
      return res.status(401).json({ message: "Acesso Negado!" });
    }

    try {
      const cnpj = req.params.cnpj;
      const empresa = await Empresa.findOne({ where: { cnpj: cnpj } });
      if (!empresa) {
        res.status(422).json({ message: "Empresa não encontrada" });
      }
      empresa.senha = undefined;
      res.status(200).json(empresa);
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async showAllEmpresa(req, res) {
    const token = getToken(req);

    try {
      const empresas = await Empresa.findAll({
        attributes: { exclude: ["senha"] },
      });
      res.status(200).json(empresas);
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async editEmp(req, res) {
    const id = req.params.id;
    const token = getToken(req);
    const empresa = await getUserByToken(token);
    //a inforvix cadastrar e a propria empresa manda informação de cnpj, local, razao
    // if(empresa.id != 1){
    //   return res.status(401).json({message:'Acesso Negado!'})
    // }

    if (!empresa) {
      return res.status(422).json({ message: "Empresa não encontrada" });
    }

    if (id != empresa.id) {
      return res.status(401).json({ message: "Acesso Negado!" });
    }

    let { cnpj } = req.body;
    const { contrato, login, senha, razao, fantasia, email, ativo } = req.body;

    if (!cnpj) {
      res.status(422).json({ message: "CNPJ é obrigatório" });
      return;
    }

    if (!validaCNPJ(cnpj)) {
      return res.status(422).json({ message: "CNPJ inválido" });
    } else {
      cnpj = cnpj.replace(/[^\d]+/g, "");
    }

    if (!contrato) {
      res.status(422).json({ message: "Contrato é obrigatório" });
      return;
    }

    if (!login) {
      res.status(422).json({ message: "login é obrigatório" });
      return;
    }

    if (!razao) {
      res.status(422).json({ message: "Razão social é obrigatório" });
      return;
    }

    if (!fantasia) {
      res.status(422).json({ message: "Fantasia é obrigatório" });
      return;
    }

    if (!email) {
      res.status(422).json({ message: "e-Mail é obrigatório" });
      return;
    }

    if (!validaEmail(email)) {
      return res.status(422).json({ message: "e-Mail inválido" });
    }

    //chegar se o e-mail exist
    const emailExiste = await Empresa.findOne({ where: { email: email } });
    if (empresa.email !== email && emailExiste) {
      res.status(422).json({ message: "e-Mail já utilizado", email });
      return;
    }

    empresa.email = email;

    //chegar se o CNPJ exist
    const cnpjExiste = await Empresa.findOne({ where: { cnpj: cnpj } });
    if (empresa.cnpj !== cnpj && cnpjExiste) {
      res.status(422).json({ message: "CNPJ já utilizado", cnpj });
      return;
    }

    empresa.cnpj = cnpj;

    //chegar se o contrato exist
    const contratoExiste = await Empresa.findOne({
      where: { contrato: contrato },
    });
    if (empresa.contrato !== contrato && contratoExiste) {
      res.status(422).json({ message: "Contrato já utilizado", contrato });
      return;
    }

    empresa.contrato = contrato;

    const loginExiste = await Empresa.findOne({ where: { login: login } });
    if (empresa.login !== login && loginExiste) {
      res.status(422).json({ message: "Login já utilizado", login });
      return;
    }
    empresa.login = login;
    empresa.razao = razao;
    empresa.fantasia = fantasia;

    if (ativo != undefined) {
      empresa.ativo = ativo;
    }

    if (senha != null) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(senha, salt);
      empresa.senha = passwordHash;
    }

    try {
      empresa.save();
      res.status(200).json({ message: "Empresa Alterada!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
