// Carrega variáveis de ambiente do arquivo .env
require("dotenv").config();
<<<<<<< Updated upstream
// Importa o módulo Express e cria uma instância da aplicação
=======

// Importa módulos
>>>>>>> Stashed changes
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Instância do Express
const app = express();
const PORT = 3000;

<<<<<<< Updated upstream
=======
//----------------
>>>>>>> Stashed changes
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server); // cria o socket

// Passa o socket para todas as rotas (como middleware ou em app.locals)
app.set("io", io);
<<<<<<< Updated upstream


// Configura o body-parser para interpretar dados URL-encoded
app.use(bodyParser.urlencoded({ extended: true }));


const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } 
};

app.use(session(sessionOptions));

// Torna `user` disponível em res.locals para os templates
app.use((req, res, next) => {
  res.locals.user = req.session.user; 
  next();
});

// Configura o middleware para servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Configura o diretório de views e define o motor de templates para Pug
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Rota para a página inicial (index.pug) passando o título "Home"
app.get("/", (req, res) => {
  console.log("User session:", req.session.user); // Log para verificação (depuração)
  console.log("Session ID:", req.session.id); // Log para verificação (depuração)
  res.render("index", { title: "Home" });
});



// Middleware para processar dados enviados via URL-encoded e JSON
=======
// Middleware para interpretar dados de formulários
app.use(bodyParser.urlencoded({ extended: true }));
>>>>>>> Stashed changes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração da sessão
const sessionOptions = {
  secret: 'sua-chave-ultra-secreta-aqui', // Use uma variável de ambiente em produção
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }, // 1 hora
  // store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }) // (se quiser persistência em MongoDB)
};
app.use(session(sessionOptions));

// Middleware para tornar `user` disponível nos templates
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Configura o mecanismo de views (Pug)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Página inicial
app.get("/", (req, res) => {
  console.log("User session:", req.session.user);
  console.log("Session ID:", req.session.id);
  res.render("index", { title: "Home" });
});

// Rotas
const userRouter = require("./routes/users");
app.use("/users", userRouter);

const sendFiles = require("./routes/send-files");
app.use("/send-files", sendFiles);

const projeto1 = require("./routes/projeto1");
app.use("/projeto1", projeto1);

<<<<<<< Updated upstream
=======
const projeto2 = require("./routes/projeto2")(io);
app.use("/projeto2", projeto2);

// Conexão com banco de dados
const conn = require("./db/conn");
conn();

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server on port ${PORT}`);
});
>>>>>>> Stashed changes

const projeto2 = require("./routes/projeto2")(io);
app.use("/projeto2", projeto2);

// Inicia o servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log("Server on port 6005");
});