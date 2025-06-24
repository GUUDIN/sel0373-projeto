// Importa o módulo Express e cria um roteador
const express = require("express");
const router = express.Router();

// Importa o módulo bcrypt para hashing de senhas
const bcrypt = require("bcrypt");
const saltRounds = 10; // Define a quantidade de rounds para gerar o salt

// Importa a configuração de projetos
const { getProjectById, getProjectRedirectUrl, getActiveProjects } = require('../config/projects');

// Variável para armazenar os usuários (in-memory, apenas para teste)
//let users = [];
const User = require("../models/user");
// Rota GET para exibir a página de registro de novo usuário
router.get("/register", (req, res) => {
  // Renderiza a view "register" e passa um erro nulo inicialmente, junto com projetos ativos
  const activeProjects = getActiveProjects();
  res.render("register", { 
    error: null, 
    user: req.session.user,
    projects: activeProjects
  });
});


// Rota GET para exibir a página de login
router.get("/", (req, res) => {
  // Renderiza a view "login" e passa um erro nulo inicialmente, junto com projetos ativos
  const activeProjects = getActiveProjects();
  res.render("login", { 
    error: null, 
    user: req.session.user,
    projects: activeProjects
  });
});

// Rota POST para processar o login do usuário
router.post("/login", async (req, res) => {
  const { username, password, project } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.render("login", { error: "Usuário ou senha incorretos!" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.user = { username: user.username };
      req.session.project = user.project; // Armazena o projeto na sessão
      console.log("Usuário autenticado:", req.session.user);
      console.log("Projeto do usuário:", req.session.project);
      if (user.project == 1) {
        return res.redirect("/projeto1");
      } else {
        return res.redirect("/projeto2");
      }
      //const redirectUrl = getProjectRedirectUrl(user.project);
      //return res.redirect(redirectUrl);
    } else {
      return res.render("login", { error: "Usuário ou senha incorretos!" });
    }
  } catch (err) {
    console.error("Erro no login:", err);
    return res.send("Erro na autenticação!");
  }
});

// Rota POST para registrar um novo usuário
router.post("/register", async (req, res) => {
  const { username, password, project } = req.body;

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.render("register", { error: "Usuário já existe!" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username,
      password: hashedPassword,
      project
    });

    await newUser.save();

    res.redirect("/users");
  } catch (err) {
    console.error("Erro no registro:", err);
    return res.status(500).send("Erro ao registrar usuário.");
  }
});

// Rota POST para atualizar as configurações do usuário
router.post("/settings", (req, res) => {
  const { project } = req.body;
  
  if (!req.session.user) {
    return res.redirect("/users");
  }
  
  // Verifica se o projeto existe
  const projectData = getProjectById(project);
  if (!projectData) {
    console.log("Projeto inválido:", project);
    return res.redirect("/");
  }
  
  // Encontra e atualiza o usuário
  const userIndex = users.findIndex(u => u.username === req.session.user.username);
  if (userIndex !== -1) {
    users[userIndex].project = project;
    req.session.user.project = project;
    console.log("Projeto atualizado para:", projectData.name);
  }
  
  // Usa a função helper para obter a URL de redirecionamento
  const redirectUrl = getProjectRedirectUrl(project);
  return res.redirect(redirectUrl);
});

// Rota GET para logout: destrói a sessão e redireciona para login
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Erro ao encerrar sessão:", err);
    }
    res.redirect("/users");
  });
});

module.exports = router;
