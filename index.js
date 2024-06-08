const express = require("express");
const cors = require("cors");
const conn = require("./db/conn");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = express();
const bcrypt = require("bcrypt");
//const bodyParser = require("body-parser");
const fs = require("fs");
//const shelljs = require("shelljs");
const config = require("./config.json");
//const { Client, LocalAuth } = require("whatsapp-web.js");

const port = process.env.port || config.port;

app.use(express.json());

app.use(cors());
// app.use(cors({credentials: true, origin: 'http://192.168.1.138:'+config.port}))

app.use(express.static("public"));

// Models
const Empresa = require("./models/Empresa");
const RepP = require("./models/Rep-p");
const Funcionario = require("./models/Funcionario");
const Marcacao = require("./models/Marcacao");
const FuncionarioRep = require("./models/FuncionarioRep");
const Operador = require("./models/Operador");

/** removendo o envio dfe WhatsApp**/
//global.client = new Client({
//  authStrategy: new LocalAuth(),
//  puppeteer: { headless: true },
//});
//global.authed = false;
//app.use(bodyParser.json({ limit: "50mb" }));
//app.use(bodyParser.urlencoded({ extended: true }));
//client.on("qr", (qr) => {
//  console.log("qr");
//  fs.writeFileSync("./routes/whatsapp-functions/last.qr", qr);
//});

//client.on("authenticated", () => {
//  console.log("AUTH!");
//  authed = true;

//  try {
//    fs.unlinkSync("./routes/whatsapp-functions/last.qr");
//  } catch (err) {}
//});

// client.on("auth_failure", () => {
//  console.log("AUTH Failed !");
//  process.exit();
//});

//client.on("ready", () => {
//  console.log("Client is ready!");
//});

//client.on("message", async (msg) => {
//  if (config.webhook.enabled) {
//    if (msg.hasMedia) {
//      const attachmentData = await msg.downloadMedia();
//    msg.attachmentData = attachmentData;
//  }
//  axios.post(config.webhook.path, { msg });
// }
//});
//client.on("disconnected", () => {
//  console.log("disconnected");
//});
//client.initialize();

//const chatRoute = require("./routes/whatsapp-functions/chatting");
//// const groupRoute = require("./components/group");
//const authRoute = require("./routes/whatsapp-functions/auth");
//// const contactRoute = require("./components/contact");
//app.use("/chat", chatRoute);
////app.use("/group", groupRoute);
//app.use("/auth", authRoute);
////app.use("/contact", contactRoute);

/** removendo o envio dfe WhatsApp**/
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RepP API",
      description:
        "Metodos para comunicação entre os sistemas e o Rep-P do PontovixMTE 2.0, bem como realização de marcação de ponto",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PATCH, POST, DELETE, PUT, OPTIONS"
  );
  next();
});

// Routes
const EmpresaRoutes = require("./routes/empresaRoutes");
app.use("/empresa", EmpresaRoutes);

const FuncionarioRoutes = require("./routes/funcinarioRoutes");
app.use("/funcionario", FuncionarioRoutes);

const RepRoutes = require("./routes/repRoutes");
app.use("/rep", RepRoutes);

const FunRepRoutes = require("./routes/funRepRoutes");
app.use("/fun_rep", FunRepRoutes);

const MarcacaoRoutes = require("./routes/marcacaoRoutes");
app.use("/marcacao", MarcacaoRoutes);

const OperadorRoutes = require("./routes/operadorRoutes");
app.use("/operador", OperadorRoutes);

// Listen
conn
  .sync()
  //.sync({ force: true })
  .then(() => {
    app.listen(port);
    // criar a 1 empresa detentora da aplicaçao
    Empresa.findOne({ where: { cnpj: "09267210000115" } }).then((value) => {
      if (!value) {
        bcrypt.genSalt(12).then((value) => {
          passwordHash = bcrypt.hash("guedes", value).then((value) => {
            Empresa.create({
              cnpj: "09267210000115",
              contrato: "00000",
              login: "guedes",
              senha: value,
              razao: "Inforvix Comercial LTDA ME",
              fantasia: "Inforvix",
              email: "henrique@inforvix.com.br",
              ativo: true,
            });
          });
        });
      }
      console.log('teste');
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
