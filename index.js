// Carrega variáveis de ambiente do arquivo .env
require("dotenv").config();

// Importa o módulo Express e cria uma instância da aplicação
const express = require("express");
const app = express();
const PORT = 6005

// Socket.IO setup
const { createServer } = require('http');
const { Server } = require('socket.io');
const server = createServer(app);
const io = new Server(server);

// Importa o módulo path para manipulação de caminhos de diretórios
const path = require("path");

// Importa o body-parser para processar dados de formulários
const bodyParser = require("body-parser");
// Sessões
const session = require("express-session");
const MongoStore = require("connect-mongo");


// Configura o body-parser para interpretar dados URL-encoded
app.use(bodyParser.urlencoded({ extended: true }));


const sessionOptions = {
  secret: 'sua-chave-ultra-secreta-aqui', //process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
};

app.use(session(sessionOptions));

// Torna `user` disponível em res.locals para os templates
app.use((req, res, next) => {
  res.locals.user = req.session.user; 
  next();
});

// Exemplo em app.js
app.use((req, res, next) => {
  res.locals.user = req.user || {}; // req.user geralmente vem do Passport
  next();
});

// Configura o middleware para servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Configura o diretório de views e define o motor de templates para Pug
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Importa a configuração de projetos
const { getProjectById, getActiveProjects, getAllProjects } = require('./config/projects');

// Rota para a página inicial (index.pug) passando o título "Home"
app.get("/", (req, res) => {
  console.log("User session:", req.session.user); // Log para verificação (depuração)
  console.log("Session ID:", req.session.id); // Log para verificação (depuração)
  
  // Preparar dados do projeto para o usuário logado
  let userProject = null;
  if (req.session.user && req.session.user.project) {
    userProject = getProjectById(req.session.user.project) || getProjectById('2');
  }
  
  // Obter todos os projetos ativos para exibir na página
  const activeProjects = getActiveProjects();
  
  res.render("index", { 
    title: "Home", 
    user: req.session.user,
    userProject: userProject,
    projects: activeProjects
  });
});

// Middleware para processar dados enviados via URL-encoded e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Importa e utiliza o roteador de usuários
const userRouter = require("./routes/users");
app.use("/users", userRouter);

// Importa e utiliza o roteador de envio de arquivos
const sendFiles = require("./routes/send-files");
app.use("/send-files", sendFiles);

// Importa e utiliza o roteador do projeto1
const projeto1 = require("./routes/projeto1")(io);
app.use("/projeto1", projeto1);

// Importa e utiliza o roteador do projeto2
const projeto2 = require("./routes/projeto2")(io);
app.use("/projeto2", projeto2);

// Inicia o servidor na porta 6005
server.listen(PORT, '0.0.0.0', () => {
  console.log("Server on port 6005");
});

