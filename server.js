// server.js
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 }, // Sessão válida por 30 minutos
  })
);

// Rotas estáticas
app.use('/css', express.static(path.join(__dirname, 'css')));

// Usuário fixo para login
const USER = { username: 'admin', password: '1234' };

// Dados em memória
let interessados = [];
let pets = [];
let adocoes = [];

// Rota principal (login)
app.get('/', (req, res) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/menu');
  }
  res.sendFile(path.join(__dirname, 'HTMLS', 'login.html'));
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.isLoggedIn = true;
    req.session.lastAccess = new Date().toLocaleString();
    return res.redirect('/menu');
  }
  res.send('<h1>Login inválido! <a href="/">Tente novamente</a></h1>');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Menu do sistema
app.get('/menu', (req, res) => {
    if (!req.session.isLoggedIn) {
      return res.redirect('/');
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Menu - Sistema de Adoção</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body>
        <nav>
          <h1>Bem-vindo ao Sistema de Adoção de Pets</h1>
          <p>Último acesso: ${req.session.lastAccess}</p>
        </nav>
        <ul>
          <li><a href="/cadastro-interessados">Cadastro de Interessados</a></li>
          <li><a href="/cadastro-pets">Cadastro de Pets</a></li>
          <li><a href="/adocao">Adotar um Pet</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </body>
      </html>
    `);
  });

// Cadastro de interessados
app.get('/cadastro-interessados', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'HTMLS', 'cadastro-interessados.html'));
});

app.post('/cadastro-interessados', (req, res) => {
  const { nome, email, telefone } = req.body;
  if (!nome || !email || !telefone) {
    return res.send('<h1>Todos os campos são obrigatórios! <a href="/cadastro-interessados">Voltar</a></h1>');
  }
  interessados.push({ nome, email, telefone });
  res.redirect('/lista-interessados');
});

app.get('/lista-interessados', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/');
  }
  let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interessados Cadastrados</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          color: #333;
          margin: 0;
          padding: 0;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }
        h1 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        ul li {
          background: #ecf0f1;
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        ul li:nth-child(even) {
          background: #dfe6e9;
        }
        .center {
          text-align: center;
          margin-top: 20px;
        }
        a {
          color: #3498db;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
          color: #2980b9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Interessados Cadastrados</h1>
        <ul>
          ${interessados.map(i => `<li><strong>${i.nome}</strong> - ${i.email} - ${i.telefone}</li>`).join('')}
        </ul>
        <div class="center">
          <a href="/menu">Voltar ao Menu</a>
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Cadastro de pets
app.get('/cadastro-pets', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'HTMLS', 'cadastro-pets.html'));
});

app.post('/cadastro-pets', (req, res) => {
  const { nome, raca, idade } = req.body;
  if (!nome || !raca || !idade) {
    return res.send('<h1>Todos os campos são obrigatórios! <a href="/cadastro-pets">Voltar</a></h1>');
  }
  pets.push({ nome, raca, idade });
  res.redirect('/lista-pets');
});

app.get('/lista-pets', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/');
  }
  let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pets Cadastrados</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          color: #333;
          margin: 0;
          padding: 0;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }
        h1 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        ul li {
          background: #ecf0f1;
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        ul li:nth-child(even) {
          background: #dfe6e9;
        }
        .center {
          text-align: center;
          margin-top: 20px;
        }
        a {
          color: #3498db;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
          color: #2980b9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Pets Cadastrados</h1>
        <ul>
          ${pets.map(p => `<li><strong>${p.nome}</strong> - ${p.raca} - ${p.idade} anos</li>`).join('')}
        </ul>
        <div class="center">
          <a href="/menu">Voltar ao Menu</a>
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Adoção de pets
app.get('/adocao', (req, res) => {
    if (!req.session.isLoggedIn) {
      return res.redirect('/');
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registrar Adoção</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body>
        <h1>Registrar Adoção</h1>
        <form action="/adocao" method="POST">
          <label for="interessado">Interessado:</label>
          <select id="interessado" name="interessado" required>
            ${interessados.map(i => `<option value="${i.nome}">${i.nome}</option>`).join('')}
          </select><br>
          <label for="pet">Pet:</label>
          <select id="pet" name="pet" required>
            ${pets.map(p => `<option value="${p.nome}">${p.nome}</option>`).join('')}
          </select><br>
          <button type="submit">Registrar Adoção</button>
        </form>
        <a href="/menu">Voltar ao Menu</a>
      </body>
      </html>
    `);
  });

app.post('/adocao', (req, res) => {
  const { interessado, pet } = req.body;
  if (!interessado || !pet) {
    return res.send('<h1>Todos os campos são obrigatórios! <a href="/adocao">Voltar</a></h1>');
  }
  adocoes.push({ interessado, pet, data: new Date().toLocaleString() });
  res.redirect('/lista-adocoes');
});

app.get('/lista-adocoes', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/');
  }
  let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Adoções Registradas</title>
      <style>
  body {
    background-color: #f0f2f5;
    color: #333;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
  }
  
  h1 {
    text-align: center;
    color: #2c3e50;
    margin-top: 20px;
    font-size: 2em;
  }
  
  ul {
    list-style: none;
    padding: 0;
    max-width: 600px;
    margin: 20px auto;
  }
  
  ul li {
    background-color: #ecf0f1;
    margin-bottom: 10px;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 1.1em;
  }
  
  ul li:nth-child(even) {
    background-color: #dfe6e9;
  }
  
  ul li::before {
    content: "🐾"; /* Ícone de patinha */
    margin-right: 8px;
  }
  
  a {
    display: block;
    text-align: center;
    margin-top: 20px;
    color: #3498db;
    font-weight: bold;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  a:hover {
    color: #2980b9;
    text-decoration: underline;
  }
</style>
    </head>
    <body>
      <div class="container">
        <h1>Adoções Registradas</h1>
        <ul>
          ${adocoes.map(a => `<li>${a.interessado} adotou ${a.pet} em ${a.data}</li>`).join('')}
        </ul>
        <div class="center">
          <a href="/menu">Voltar ao Menu</a>
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
