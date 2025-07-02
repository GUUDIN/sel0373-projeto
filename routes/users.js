// Importa o módulo Express e cria um roteador
const express = require("express");
const router = express.Router();

// Importa o módulo bcrypt para hashing de senhas
const bcrypt = require("bcrypt");
const saltRounds = 10; // Define a quantidade de rounds para gerar o salt

// Importa a configuração de projetos
const { getProjectById, getProjectRedirectUrl, getActiveProjects } = require('../config/projects');
// Importa o modelo User
const User = require("../models/user");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  // Redirect to login page if not authenticated
  res.redirect("/users");
};

// Variável para armazenar os usuários (in-memory, apenas para teste)
//let users = [];


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
      // Salvar TODOS os dados relevantes na sessão
      req.session.user = { 
          username: user.username,
          project: user.project,
          avatarUrl: user.avatarUrl
      };
      req.session.project = user.project; // Armazena o projeto na sessão
      console.log("Usuário autenticado:", req.session.user);
      console.log("Projeto do usuário:", req.session.project);
      if (user.project == 1) {
        return res.redirect("/projeto1");
      } else {
        return res.redirect("/projeto2");
      }
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


router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
      return res.status(500).send('Erro ao sair');
    }
    res.redirect('/'); // ou redirecione para a página de login
  });
});

// Rota POST para atualizar as configurações do usuário (troca de projeto)
router.post("/settings", isAuthenticated, async (req, res) => {
  const { project } = req.body;
  const { username } = req.session.user;

  try {
    // Encontra e atualiza o usuário no banco de dados
    const updatedUser = await User.findOneAndUpdate(
      { username }, 
      { project: parseInt(project) }, // ← Garantir que salva como number
      { new: true }
    );

    // Padronizar como number em ambos os casos
    const projectNumber = parseInt(project);

    if (!updatedUser) {
      console.log(`Usuário ${username} não encontrado no banco, atualizando apenas a sessão`);
      req.session.user.project = projectNumber;
    } else {
      req.session.user.project = projectNumber; // ← Padronizar
    }

    console.log(`Projeto atualizado para: ${req.session.user.project} (tipo: ${typeof req.session.user.project})`);

    // Redireciona para a página inicial ou para o projeto selecionado
    if (projectNumber === 1) {
      res.redirect("/projeto1");
    } else if (projectNumber === 2) {
      res.redirect("/projeto2");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error("Erro ao atualizar as configurações do usuário:", err);
    res.status(500).send("Erro ao atualizar as configurações.");
  }
});

module.exports = router;
