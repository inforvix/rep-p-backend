const express = require("express");
const cors = require("cors");
const conn = require("./db/conn");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = express();
const bcrypt = require("bcrypt");
const fs = require("fs");
const config = require("./config.json");

const port = process.env.port || config.port;

app.use(express.json());

app.use(cors());

app.use(express.static("public"));

// Models
const Empresa = require("./models/Empresa");
const RepP = require("./models/Rep-p");
const Funcionario = require("./models/Funcionario");
const Marcacao = require("./models/Marcacao");
const FuncionarioRep = require("./models/FuncionarioRep");
const Operador = require("./models/Operador");

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

conn
  .sync()
  .then(() => {
    app.listen(port, console.log('Sistema rodando em http://localhost:50001/'));  
    Empresa.findOne({ where: { cnpj: "73172362000133" } }).then((value) => {
      if (!value) {
        bcrypt.genSalt(12).then((value) => {
          passwordHash = bcrypt.hash("guedes", value).then((value) => {
            Empresa.create({
              cnpj: "73172362000133",
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
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
