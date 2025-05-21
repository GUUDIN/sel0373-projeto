// Importa o módulo Express e cria um roteador
const express = require("express");
const router = express.Router();

// Importa o módulo bcrypt para hashing de senhas
const bcrypt = require("bcrypt");
const saltRounds = 10; // Define a quantidade de rounds para gerar o salt

// Importa o modelo User
const User = require("../models/user");

// Rota GET para exibir a página de registro de novo usuário
router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// Rota GET para exibir a página de login
router.get("/", (req, res) => {
  res.render("login", { error: null });
});

// Rota POST para processar o login do usuário
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

<<<<<<< Updated upstream
  // Compara a senha fornecida com o hash armazenado usando bcrypt
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      console.log("Resultado da Comparação:", err); // Log para verificação (depuração)
      // Em caso de erro na comparação, retorna erro 500
      return res.status(500).send("Erro na autenticação!");
    }
    console.log("Comparison Result:", result); // Log para verificação (depuração)
    if (result) {
      // Se as senhas coincidirem, redireciona para a rota de envio de arquivos
      req.session.user = {
        username: user.username
      };
      console.log("User logado", user.username)
      //req.session.user = { username }; // salva usuário na sessão
      if(user.project ==1){
        return res.redirect("/projeto1");
      }
      else{
        return res.redirect("/projeto2");
      }
      
    } else {
      // Se não coincidirem, renderiza a página de login com mensagem de erro
=======
  try {
    const user = await User.findOne({ username });

    if (!user) {
>>>>>>> Stashed changes
      return res.render("login", { error: "Usuário ou senha incorretos!" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.user = { username: user.username };

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
    return res.status(500).send("Erro na autenticação!");
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
