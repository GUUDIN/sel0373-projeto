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
      req.session.user = { username: user.username };
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

// Rota POST para atualizar as configurações do usuário
router.post("/settings", async (req, res) => {
  const { project } = req.body;

  if (!req.session.user) return res.redirect("/users");

  const projectData = getProjectById(project);
  if (!projectData) return res.redirect("/");

  try {
    await User.updateOne(
      { username: req.session.user.username },
      { $set: { project } }
    );

    // Atualiza também a sessão para refletir a mudança
    req.session.project = project;

    const redirectUrl = getProjectRedirectUrl(project);
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("Erro ao atualizar projeto:", err);
    return res.redirect("/");
  }
});


router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Erro ao encerrar sessão:", err);
    }
    res.redirect("/users");
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
      { project }, 
      { new: true } // Retorna o documento atualizado
    );

    // Se o usuário não foi encontrado no banco (usuário de teste), apenas atualiza a sessão
    if (!updatedUser) {
      console.log(`Usuário ${username} não encontrado no banco, atualizando apenas a sessão`);
      req.session.user.project = parseInt(project);
    } else {
      // Atualiza a sessão com as novas informações do banco
      req.session.user.project = updatedUser.project;
    }

    // Redireciona para a página inicial ou para o projeto selecionado
    if (project == 1) {
      res.redirect("/projeto1");
    } else if (project == 2) {
      res.redirect("/projeto2");
    } else {
      res.redirect("/"); // Fallback para a página inicial
    }
  } catch (err) {
    console.error("Erro ao atualizar as configurações do usuário:", err);
    res.status(500).send("Erro ao atualizar as configurações.");
  }
});

module.exports = router;
