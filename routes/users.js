// Importa o módulo Express e cria um roteador
const express = require("express");
const router = express.Router();

// Importa o módulo bcrypt para hashing de senhas
const bcrypt = require("bcrypt");
const saltRounds = 10; // Define a quantidade de rounds para gerar o salt

// Importa a configuração de projetos
const { getProjectById, getProjectRedirectUrl, getActiveProjects } = require('../config/projects');

// Variável para armazenar os usuários (in-memory, apenas para teste)
let users = [];

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
router.post("/login", (req, res) => {
  const { username, password, project } = req.body;
  
  // Procura um usuário com o username fornecido
  const user = users.find(u => u.username === username);
  if (!user) {
    // Se o usuário não for encontrado, renderiza a página de login com mensagem de erro
    return res.render("login", { error: "Usuário ou senha incorretos!" });
  }

  // Compara a senha fornecida com o hash armazenado usando bcrypt
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      console.log("Resultado da Comparação:", err); // Log para verificação (depuração)
      // Em caso de erro na comparação, retorna erro 500
      return res.status(500).send("Erro na autenticação!");
    }
    console.log("Comparison Result:", result); // Log para verificação (depuração)
    if (result) {
      // Se as senhas coincidirem, redireciona baseado no projeto do usuário
      req.session.user = {
        username: user.username,
        project: user.project
      };
      console.log("User logado", user.username)
      
      // Usa a função helper para obter a URL de redirecionamento
      const redirectUrl = getProjectRedirectUrl(user.project);
      return res.redirect(redirectUrl);
      
    } else {
      // Se não coincidirem, renderiza a página de login com mensagem de erro
      return res.render("login", { error: "Usuário ou senha incorretos!" });
    }
  });
});

// Rota POST para registrar um novo usuário
router.post("/register", (req, res) => {
  const { username, password, project } = req.body;
  
  // Verifica se já existe um usuário com o mesmo username
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    // Se o usuário já existe, renderiza a página de registro com uma mensagem de erro
    const activeProjects = getActiveProjects();
    return res.render("register", { 
      error: "Usuário já existe!", 
      user: req.session.user,
      projects: activeProjects
    });
  }
  
  // Hash a senha usando bcrypt antes de armazenar o usuário
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      // Em caso de erro durante o hash, retorna erro 500
      return res.status(500).send("Erro ao processar a senha.");
    }
    console.log("Hashed password:", hash); // Log do hash (remova em produção)
    // Adiciona o novo usuário ao array, armazenando o username e o hash da senha
    users.push({ username, password: hash, project });
    console.log("Projeto:", project);
    // Redireciona para a página de login após o registro bem-sucedido
    res.redirect("/users");
  });
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

// Rota POST para logout: destrói a sessão e redireciona para login
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Erro ao encerrar sessão:", err);
    }
    res.redirect("/");
  });
});

// Exporta o roteador para utilização em outras partes da aplicação
module.exports = router;