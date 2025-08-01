const sequelize = require("sequelize");
const { Op } = require("sequelize");
const { DateTime } = require("luxon");

const FunRep = require("../models/FuncionarioRep");
const Rep = require("../models/Rep-p");
const Funcionario = require("../models/Funcionario");
const Marcacao = require("../models/Marcacao");

const extrairParametroFaceId = require("../helpers/globais");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const getUserByTokenFuncionario = require("../helpers/get-user-by-token-funcionario");
const sendMail = require("../helpers/enviar-email");
const sendZap = require("../helpers/enviar-whatsapp");
const hash_sha256 = require("../helpers/create-sha-256");

module.exports = class MarcacaoController {
  static async reconectarAoServidor(req, res) {
    //console.log('Aparalho ativo')
    res.status(200).send("");
  }

  static async marcacaoFaceID(req, res) {
    let body = "";

    // Recebe os dados do corpo da requisição
    await req.on("data", (chunk) => {
      body += chunk.toString();
    });

    // Extrai o número serial do corpo
    var numeroSerial = await extrairParametroFaceId(body, "device_id");
    const idFuncionario = await extrairParametroFaceId(body, "user_id");
    var nomeFuncionario = await extrairParametroFaceId(body, "user_name");

    var cpf = idFuncionario.slice(-11);
    var idEmpresa = idFuncionario.slice(0, -11);

    if (idFuncionario == 0) {
      //RELOGIO NAO IDENTIFICOU FUNCIONARIO
      return res.status(200).json({
        result: {
          event: 6,
          user_id: 6,
          user_name: "100 - Erro",
          user_image: false,
          portal_id: 1,
          actions: [],
        },
      });
    }

    // Busca o REP pelo número serial
    const reps = await Rep.findAll({
      where: { numero_serial: numeroSerial, EmpresaId: idEmpresa },
    });
    if (reps.length < 1) {
      //REP NAO CADASTRADO NO REP-P
      return res.status(200).json({
        result: {
          event: 6,
          user_id: 6,
          user_name: "101 - Erro",
          user_image: false,
          portal_id: 1,
          actions: [],
        },
      });
    }

    const repid = reps[0].id;
    const cnpj_cpf_emp = reps[0].cnpj_cpf_emp;
    const local = reps[0].local;
    const online = 0; //rep-p Informar "0" para marcação on-line ou "1" para marcaçãooff-line.
    const tipoRegistro = 7;
    const tipoOperacao = "1"; //rep-p "01": aplicativo mobile; "02":browser(navegador internet); "03": aplicativo desktop; "04": dispositivo eletrônico; "05": outro dispositivo eletrônico não especificado acima.

    try {
      const funcionario = await Funcionario.findOne({ where: { cpf: cpf } });
      if (!funcionario) {
        //FUNCIONARIO NAO ENCONTRADO
        return res.status(200).json({
          result: {
            event: 6,
            user_id: 6,
            user_name: "102 - Erro",
            user_image: false,
            portal_id: 1,
            actions: [],
          },
        });
      }

      const funRep = await FunRep.findOne({
        where: { FuncionarioId: funcionario.id, RepPId: repid },
      });
      if (!funRep) {
        //FUNCIONARIO NAO CADASTRADO NO REP
        return res.status(200).json({
          result: {
            event: 6,
            user_id: 6,
            user_name: "103 - Erro",
            user_image: false,
            portal_id: 1,
            actions: [],
          },
        });
      }

      let ultimaMarc = await Marcacao.findOne({
        attributes: [[sequelize.fn("max", sequelize.col("nsr")), "nsr"]],
        where: { RepPId: repid },
      });

      if (ultimaMarc.nsr == null) {
        ultimaMarc.nsr = 1;
      } else {
        ultimaMarc.nsr++;
      }

      let hashAnterior;
      if (ultimaMarc.tipoRegistro == 7) {
        hashAnterior = ultimaMarc.crc16_sha256;
      } else {
        hashAnterior = "";
      }

      const dateFull = new Date();

      const dia = dateFull.getDate().toString().padStart(2, "0");
      const mes = (dateFull.getMonth() + 1).toString().padStart(2, "0");
      const ano = dateFull.getFullYear().toString();
      const date = `${mes}/${dia}/${ano}`;

      const hora = dateFull.toLocaleString().split(" ")[1];

      //online mas offline
      let codigoHash =
        ultimaMarc.nsr +
        tipoRegistro +
        date +
        hora +
        cpf +
        date +
        hora +
        tipoOperacao +
        online +
        hashAnterior;
      codigoHash = hash_sha256(codigoHash);
      const marc = await Marcacao.create({
        data: date,
        hora: hora,
        nsr: ultimaMarc.nsr,
        cpf: cpf,
        cnpj: cnpj_cpf_emp,
        local: local,
        inpi_codigo: "BR 51 2025 001324-8",
        RepPId: repid,
        FuncionarioId: funcionario.id,
        tipoRegistro: tipoRegistro,
        tipoOperacao: tipoOperacao,
        online: online,
        crc16_sha256: codigoHash,
      });

      marc.save();
      sendMail(funcionario, marc, date);
      return res.status(200).json({
        result: {
          event: 7,
          user_id: 6,
          user_name: nomeFuncionario,
          user_image: false,
          portal_id: 1,
          actions: [],
        },
      });
    } catch (err) {
      return res.status(200).json({
        result: {
          event: 6,
          user_id: 6,
          user_name: "104 - Erro",
          user_image: false,
          portal_id: 1,
          actions: [],
        },
      });
    }
  }

  static async registraToken(req, res) {
    const cpf = req.user.fun_cpf;
    const repid = req.user.fun_rep_padrao;
    const empresaId = req.user.fun_empresa;

    const { latitude, longitude } = req.body;

    console.log("a latitude informado foi: " + latitude);
    console.log("a latitude informado foi: " + longitude);

    const token = getToken(req);
    const empresa = await getUserByTokenFuncionario(token);
    const online = 0; //rep-p Informar "0" para marcação on-line ou "1" para marcaçãooff-line.
    const tipoRegistro = 7;
    const tipoOperacao = req.get("tipoOperacao"); //rep-p "01": aplicativo mobile; "02":browser(navegador internet); "03": aplicativo desktop; "04": dispositivo eletrônico; "05": outro dispositivo eletrônico não especificado acima.

    console.log("Registrnado via token");

    if (!cpf) {
      return res.status(422).json({ message: "O CPF é obrigatório" });
    }

    if (!repid) {
      return res.status(422).json({ message: "O ID do Rep-P é obrigatório" });
    }

    try {
      const funcionario = await Funcionario.findOne({ where: { cpf: cpf } });
      if (!funcionario) {
        return res.status(422).json({ message: "Funcionario não encontrado" });
      }

      const funRep = await FunRep.findOne({
        where: { FuncionarioId: funcionario.id, RepPId: repid },
      });
      if (!funRep) {
        return res
          .status(422)
          .json({ message: "Funcionario não cadastrado nesse Rep-p" });
      }

      const rep = await Rep.findByPk(repid);
      if (!rep) {
        return res.status(422).json({ message: "Rep-P não encontrado" });
      }

      if (!rep.ativo) {
        return res.status(422).json({ message: "Rep-P não está ativo" });
      }

      if (rep.EmpresaId != empresaId) {
        return res
          .status(401)
          .json({ message: "Acesso Negado! Rep não pertence a sua empesa" });
      }

      let ultimaMarc = await Marcacao.findOne({
        attributes: [[sequelize.fn("max", sequelize.col("nsr")), "nsr"]],
        where: { RepPId: rep.id },
      });

      if (ultimaMarc.nsr == null) {
        ultimaMarc.nsr = 1;
      } else {
        ultimaMarc.nsr++;
      }

      let hashAnterior;
      if (ultimaMarc.tipoRegistro == 7) {
        hashAnterior = ultimaMarc.crc16_sha256;
      } else {
        hashAnterior = "";
      }

      const dateFull = new Date();

      const dia = dateFull.getDate().toString().padStart(2, "0");
      const mes = (dateFull.getMonth() + 1).toString().padStart(2, "0");
      const ano = dateFull.getFullYear().toString();
      const date = `${mes}/${dia}/${ano}`;

      const hora = dateFull.toLocaleString().split(" ")[1];

      let codigoHash =
        ultimaMarc.nsr +
        tipoRegistro +
        date +
        hora +
        cpf +
        date +
        hora +
        tipoOperacao +
        online +
        hashAnterior;
      codigoHash = hash_sha256(codigoHash);
      const marc = await Marcacao.create({
        data: date,
        hora: hora,
        nsr: ultimaMarc.nsr,
        cpf: cpf,
        cnpj: rep.cnpj_cpf_emp,
        local: rep.local,
        inpi_codigo: "BR 51 2025 001324-8",
        RepPId: rep.id,
        FuncionarioId: funcionario.id,
        tipoRegistro: tipoRegistro,
        tipoOperacao: tipoOperacao,
        online: online,
        crc16_sha256: codigoHash,
        latitude: latitude,
        longitude: longitude,
      });

      marc.save();
      res.status(200).json("Marcação inserida");
      sendMail(funcionario, marc, date);
      if (funcionario.celular != undefined) {
        sendZap(funcionario, marc, date);
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async registraCPF(req, res) {
    const cpf = req.params.cpf;

    const token = getToken(req);
    const empresa = await getUserByToken(token);
    const online = 0; //rep-p Informar "0" para marcação on-line ou "1" para marcaçãooff-line.
    const tipoRegistro = 7;
    const tipoOperacao = "03";

    if (!cpf) {
      return res.status(422).json({ message: "O CPF é obrigatório" });
    }

    const funcionario = await Funcionario.findOne({
      where: { cpf: cpf, EmpresaId: empresa.id },
    });
    const repid = funcionario.rep_padrao;

    if (!repid) {
      return res.status(422).json({ message: "O ID do Rep-P é obrigatório" });
    }

    try {
      if (!funcionario) {
        return res.status(422).json({ message: "Funcionario não encontrado" });
      }

      const funRep = await FunRep.findOne({
        where: { FuncionarioId: funcionario.id, RepPId: repid },
      });
      if (!funRep) {
        return res
          .status(422)
          .json({ message: "Funcionario não cadastrado nesse Rep-p" });
      }

      const rep = await Rep.findByPk(repid);
      if (!rep) {
        return res.status(422).json({ message: "Rep-P não encontrado" });
      }

      if (!rep.ativo) {
        return res.status(422).json({ message: "Rep-P não está ativo" });
      }

      if (rep.EmpresaId != empresa.id) {
        return res
          .status(401)
          .json({ message: "Acesso Negado! Rep não pertence a sua empesa" });
      }

      let ultimaMarc = await Marcacao.findOne({
        attributes: [[sequelize.fn("max", sequelize.col("nsr")), "nsr"]],
        where: { RepPId: rep.id },
      });

      if (ultimaMarc.nsr == null) {
        ultimaMarc.nsr = 1;
      } else {
        ultimaMarc.nsr++;
      }

      let hashAnterior;
      if (ultimaMarc.tipoRegistro == 7) {
        hashAnterior = ultimaMarc.crc16_sha256;
      } else {
        hashAnterior = "";
      }

      const dateFull = new Date();

      const dia = dateFull.getDate().toString().padStart(2, "0");
      const mes = (dateFull.getMonth() + 1).toString().padStart(2, "0");
      const ano = dateFull.getFullYear().toString();
      const date = `${mes}/${dia}/${ano}`;

      const hora = dateFull.toLocaleString().split(" ")[1];

      //online mas offline
      let codigoHash =
        ultimaMarc.nsr +
        tipoRegistro +
        date +
        hora +
        cpf +
        date +
        hora +
        tipoOperacao +
        online +
        hashAnterior;
      codigoHash = hash_sha256(codigoHash);
      const marc = await Marcacao.create({
        data: date,
        hora: hora,
        nsr: ultimaMarc.nsr,
        cpf: cpf,
        cnpj: rep.cnpj_cpf_emp,
        local: rep.local,
        inpi_codigo: "BR 51 2025 001324-8",
        RepPId: rep.id,
        FuncionarioId: funcionario.id,
        tipoRegistro: tipoRegistro,
        tipoOperacao: tipoOperacao,
        online: online,
        crc16_sha256: codigoHash,
      });

      marc.save();
      res.status(200).json("Marcação inserida");
      sendMail(funcionario, marc, date);
      if (funcionario.celular != undefined) {
        sendZap(funcionario, marc, date);
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async registraFaceIdOffLine(req, res) {
    const { access_logs } = req.body;

    if (!Array.isArray(access_logs)) {
      return res.status(400).json({
        message: "Formato inválido. Esperado access_logs como array.",
      });
    }

    for (const log of access_logs) {
      try {
        const idFuncionario = log.user_id.toString();
        const timestemp = log.time;
        const numeroSerialAparelho = log.device_id.toString();

        const cpf = idFuncionario.slice(-11);
        const empresaId = idFuncionario.slice(0, -11);
        const online = 1;
        const tipoRegistro = 7;
        const tipoOperacao = "01";

        if (!cpf) continue;

        const funcionario = await Funcionario.findOne({
          where: { cpf, EmpresaId: empresaId },
        });
        if (!funcionario) continue;

        const reps = await Rep.findAll({
          where: { numero_serial: numeroSerialAparelho, EmpresaId: empresaId },
        });
        if (!reps.length) continue;

        const dateFull = new Date((timestemp + 3 * 3600) * 1000); // Adiciona 3h em segundos
        const dia = dateFull.getDate().toString().padStart(2, "0");
        const mes = (dateFull.getMonth() + 1).toString().padStart(2, "0");
        const ano = dateFull.getFullYear().toString();
        const date = `${mes}/${dia}/${ano}`;
        const hora = dateFull.toLocaleTimeString("pt-BR", { hour12: false }); // Formato 24h, sem AM/PM

        const marcacao = await Marcacao.findAll({
          where: { hora: hora, data: date, online: 1, cpf: cpf },
        });

        if (marcacao.length > 0) {
          continue;
        }

        const rep = reps[0];
        if (!rep.ativo || rep.EmpresaId != empresaId) continue;

        const funRep = await FunRep.findOne({
          where: { FuncionarioId: funcionario.id, RepPId: rep.id },
        });
        if (!funRep) continue;

        let ultimaMarc = await Marcacao.findOne({
          attributes: [[sequelize.fn("max", sequelize.col("nsr")), "nsr"]],
          where: { RepPId: rep.id },
          raw: true,
        });

        let nsr = ultimaMarc?.nsr ? parseInt(ultimaMarc.nsr) + 1 : 1;

        let hashAnterior = "";
        const ultimaMarcFull = await Marcacao.findOne({
          where: { RepPId: rep.id },
          order: [["nsr", "DESC"]],
        });
        if (ultimaMarcFull?.tipoRegistro == 7) {
          hashAnterior = ultimaMarcFull.crc16_sha256;
        }

        let codigoHash =
          nsr +
          tipoRegistro +
          date +
          hora +
          cpf +
          date +
          hora +
          tipoOperacao +
          online +
          hashAnterior;
        codigoHash = hash_sha256(codigoHash);

        await Marcacao.create({
          data: date,
          hora: hora,
          nsr: nsr,
          cpf: cpf,
          cnpj: rep.cnpj_cpf_emp,
          local: rep.local,
          inpi_codigo: "BR 51 2025 001324-8",
          RepPId: rep.id,
          FuncionarioId: funcionario.id,
          tipoRegistro,
          tipoOperacao,
          online,
          crc16_sha256: codigoHash,
        });
      } catch (err) {
        console.error(`Erro ao processar log ID ${log.id}:`, err.message);
        continue;
      }
    }

    return res.status(200).json({ message: "Processamento concluído" });
  }

  static async registraPIS(req, res) {
    const pis = req.params.pis;
    const repid = req.params.id;

    const token = getToken(req);
    const empresa = await getUserByToken(token);
    const online = 0; //rep-p Informar "0" para marcaçãoon-lineou "1" para marcaçãooff-line.
    const tipoRegistro = 7;
    const tipoOperacao = "03";
    if (!pis) {
      return res.status(422).json({ message: "O PIS é obrigatório" });
    }

    if (!repid) {
      return res.status(422).json({ message: "O ID do Rep-P é obrigatório" });
    }

    try {
      const funcionario = await Funcionario.findOne({
        where: { pis: pis, EmpresaId: empresa.id },
      });
      if (!funcionario) {
        return res.status(422).json({ message: "Funcionario não encontrado" });
      }

      const funRep = await FunRep.findOne({
        where: { FuncionarioId: funcionario.id, RepPId: repid },
      });
      if (!funRep) {
        return res
          .status(422)
          .json({ message: "Funcionario não cadastrado nesse Rep-p" });
      }

      const rep = await Rep.findByPk(repid);
      if (!rep) {
        return res.status(422).json({ message: "Rep-P não encontrado" });
      }

      if (!rep.ativo) {
        return res.status(422).json({ message: "Rep-P não está ativo" });
      }

      if (rep.EmpresaId != empresa.id) {
        return res
          .status(401)
          .json({ message: "Acesso Negado! Rep não pertence a sua empresa" });
      }

      let ultimaMarc = await Marcacao.findOne({
        attributes: [[sequelize.fn("max", sequelize.col("nsr")), "nsr"]],
        where: { RepPId: rep.id },
      });

      if (ultimaMarc.nsr == null) {
        ultimaMarc.nsr = 1;
      } else {
        ultimaMarc.nsr++;
      }

      let hashAnterior;
      if (ultimaMarc.tipoRegistro == 7) {
        hashAnterior = ultimaMarc.crc16_sha256;
      } else {
        hashAnterior = "";
      }

      const dateFull = new Date();

      const dia = dateFull.getDate().toString().padStart(2, "0");
      const mes = (dateFull.getMonth() + 1).toString().padStart(2, "0");
      const ano = dateFull.getFullYear().toString();
      const date = `${mes}/${dia}/${ano}`;

      const hora = dateFull.toLocaleString().split(" ")[1];

      let codigoHash =
        ultimaMarc.nsr +
        tipoRegistro +
        date +
        hora +
        funcionario.cpf +
        date +
        hora +
        tipoOperacao +
        online +
        hashAnterior;
      codigoHash = hash_sha256(codigoHash);
      const marc = await Marcacao.create({
        data: date,
        hora: hora,
        nsr: ultimaMarc.nsr,
        cpf: funcionario.cpf,
        cnpj: rep.cnpj_cpf_emp,
        local: rep.local,
        inpi_codigo: "BR 51 2025 001324-8",
        RepPId: rep.id,
        FuncionarioId: funcionario.id,
        tipoRegistro: tipoRegistro,
        tipoOperacao: tipoOperacao,
        online: online,
        crc16_sha256: codigoHash,
      });

      marc.save();
      res.status(200).json("Marcação inserida");
      sendMail(funcionario, marc, date);
      if (funcionario.celular != undefined) {
        console.log(funcionario.celular);
        sendZap(funcionario, marc, date);
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async registraFaceId(req, res) {
    const cpf = req.params.cpf;
    const repid = req.params.id;

    const token = getToken(req);
    const empresa = await getUserByToken(token);
    const online = 0; //rep-p Informar "0" para marcação on-line ou "1" para marcaçãooff-line.
    const tipoRegistro = 7;
    const tipoOperacao = req.get("tipoOperacao"); //rep-p "01": aplicativo mobile; "02":browser(navegador internet); "03": aplicativo desktop; "04": dispositivo eletrônico; "05": outro dispositivo eletrônico não especificado acima.

    if (!cpf) {
      return res.status(422).json({ message: "O CPF é obrigatório" });
    }

    if (!repid) {
      return res.status(422).json({ message: "O ID do Rep-P é obrigatório" });
    }

    try {
      const funcionario = await Funcionario.findOne({
        where: { cpf: cpf, EmpresaId: empresa.id },
      });
      if (!funcionario) {
        return res.status(422).json({ message: "Funcionario não encontrado" });
      }

      const funRep = await FunRep.findOne({
        where: { FuncionarioId: funcionario.id, RepPId: repid },
      });
      if (!funRep) {
        return res
          .status(422)
          .json({ message: "Funcionario não cadastrado nesse Rep-p" });
      }

      const rep = await Rep.findByPk(repid);
      if (!rep) {
        return res.status(422).json({ message: "Rep-P não encontrado" });
      }

      console.log("Verificando se o REP esta ATIVO FACE ID");
      if (!rep.ativo) {
        return res.status(422).json({ message: "Rep-P não está ativo" });
      }

      if (rep.EmpresaId != empresa.id) {
        return res
          .status(401)
          .json({ message: "Acesso Negado! Rep não pertence a sua empesa" });
      }

      let ultimaMarc = await Marcacao.findOne({
        attributes: [[sequelize.fn("max", sequelize.col("nsr")), "nsr"]],
        where: { RepPId: rep.id },
      });

      if (ultimaMarc.nsr == null) {
        ultimaMarc.nsr = 1;
      } else {
        ultimaMarc.nsr++;
      }

      let hashAnterior;
      if (ultimaMarc.tipoRegistro == 7) {
        hashAnterior = ultimaMarc.crc16_sha256;
      } else {
        hashAnterior = "";
      }

      const dateFull = new Date();

      const dia = dateFull.getDate().toString().padStart(2, "0");
      const mes = (dateFull.getMonth() + 1).toString().padStart(2, "0");
      const ano = dateFull.getFullYear().toString();
      const date = `${mes}/${dia}/${ano}`;

      const hora = dateFull.toLocaleString().split(" ")[1];

      //online mas offline
      let codigoHash =
        ultimaMarc.nsr +
        tipoRegistro +
        date +
        hora +
        cpf +
        date +
        hora +
        tipoOperacao +
        online +
        hashAnterior;
      codigoHash = hash_sha256(codigoHash);
      const marc = await Marcacao.create({
        data: date,
        hora: hora,
        nsr: ultimaMarc.nsr,
        cpf: cpf,
        cnpj: rep.cnpj_cpf_emp,
        local: rep.local,
        inpi_codigo: "BR 51 2025 001324-8",
        RepPId: rep.id,
        FuncionarioId: funcionario.id,
        tipoRegistro: tipoRegistro,
        tipoOperacao: tipoOperacao,
        online: online,
        crc16_sha256: codigoHash,
      });

      marc.save();
      res.status(200).json("Marcação inserida");
      sendMail(funcionario, marc, date);
      if (funcionario.celular != undefined) {
        sendZap(funcionario, marc, date);
      }
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async recolheMarc(req, res) {
    const nsr = req.params.nsr;
    const page = parseInt(req.query.page || 1);
    const limit = req.query.limit || 20;
    const salto = (page - 1) * limit;
    if (!nsr) {
      nsr = 1;
    }
    const repid = req.params.idrep;

    const token = getToken(req);
    const empresa = await getUserByToken(token);

    const rep = await Rep.findByPk(repid);
    if (!rep) {
      res.status(422).json({ message: "Rep-P não encontrado" });
    }

    console.log("Recolhendo Marcaçao");
    if (!rep.ativo) {
      res.status(422).json({ message: "Rep-P não está ativo" });
    }

    if (rep.EmpresaId != empresa.id) {
      return res
        .status(401)
        .json({ message: "Acesso Negado! Rep não pertence a sua empesa" });
    }

    try {
      const { count, rows } = await Marcacao.findAndCountAll({
        limit: limit,
        offset: salto,
        where: { RepPId: repid, tipoRegistro: 7, nsr: { [Op.gte]: nsr } },
        order: [["id", "ASC"]],
        attributes: [
          "nsr",
          "cpf",
          "data",
          "hora",
          "cnpj",
          "inpi_codigo",
          "longitude",
          "latitude",
        ],
      });

      const totPage = Math.ceil(count / limit);
      res
        .status(200)
        .json({ pagina: page, totalpaginas: totPage, marcacoes: rows });
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async marcacaoFunc(req, res) {
    const cpf = req.params.cpf;

    const token = getToken(req);
    const empresa = await getUserByToken(token);

    try {
      const dataAtual = new Date();
      const dataFormatada = dataAtual.toISOString().split("T")[0];
      const rows = await Marcacao.findAll({
        where: { tipoRegistro: 7, cpf: cpf, data: dataFormatada },
        order: [["id", "ASC"]],
        attributes: ["nsr", "cpf", "data", "hora", "cnpj", "inpi_codigo"],
      });

      res.status(200).json({ marcacoes: rows });
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async buscarMarcacaoPorPeriodo(req, res) {
    const cpf = req.params.cpf;
    const dataInicio = req.params.dataInicio;
    const dataFim = req.params.dataFim;

    try {
      const inicio = new Date(dataInicio);
      inicio.setHours(21, 0, 0, 0);

      const fim = new Date(dataFim);
      fim.setHours(44, 59, 59, 999);

      const rows = await Marcacao.findAll({
        where: {
          tipoRegistro: 7,
          cpf: cpf,
          data: {
            [Op.gte]: inicio,
            [Op.lte]: fim,
          },
        },
        order: [["id", "ASC"]],
        attributes: ["nsr", "cpf", "data", "hora", "cnpj", "inpi_codigo"],
      });

      res.status(200).json({ marcacoes: rows });
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async informarObservacaoNaMarcacao(req, res) {
    const { nsr, cpf, hora, observacao } = req.body;
    try {
      await Marcacao.update(
        {
          observacao: observacao,
        },
        {
          where: {
            cpf: cpf,
            nsr: nsr,
            hora: hora,
          },
        }
      );

      res.status(200).json("Observação informada com sucesso");
    } catch (err) {
      res.status(500).json(err.message);
    }
  }

  static async buscarObservacaoMarcacao(req, res) {

    const token = getToken(req);
    const dataInicio = req.params.dataInicio;
    const dataFim = req.params.dataFim;
    const empresa = await getUserByToken(token);

    try {
      const inicio = new Date(dataInicio);
      inicio.setHours(21, 0, 0, 0);

      const fim = new Date(dataFim);
      fim.setHours(44, 59, 59, 999);

      const rows = await Marcacao.findAll({
        where: {
        cnpj: empresa.cnpj,
        observacao: {
          [Op.ne]: null
        },
          data: {
            [Op.gte]: inicio,
            [Op.lte]: fim,
          },
        },
        attributes: ["nsr", "cpf", "observacao"],
      });

      res.status(200).json({ marcacoes: rows });
    } catch (err) {
      res.status(500).json(err.message);
    }
  }
};
