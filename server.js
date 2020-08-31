const fs = require('fs');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const server = jsonServer.create();

const router = jsonServer.router('./db.json');

server.use(cors());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

const SECRET_KEY = '123456789';
const expiresIn = '1h';

// Create a token from a payload
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Verify the token
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) => (decode !== undefined ? decode : err));
}

server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const userdb = JSON.parse(fs.readFileSync('./db.json', 'UTF-8')).users;
  const user = userdb.find((user) => user.email === email && user.password === password);
  if (!user) {
    const status = 401;
    const message = 'E-mail ou senha incorretos';
    res.status(status).json({ status, message });
    return;
  }
  const token = createToken({ email, password });
  res.status(200).json({ token, user });
});

// server.use((req, res, next) => {
//   console.log(req);
//   if (req.originalUrl === '/users' || req.originalUrl === '/auth/login') return next();

//   if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
//     const status = 401;
//     const message = 'Você precisa estar logado para fazer isso';
//     res.status(status).json({ status, message });
//     return;
//   }
//   try {
//     verifyToken(req.headers.authorization.split(' ')[1]);
//     next();
//   } catch (err) {
//     const status = 401;
//     const message = 'Token de autenticação inválido';
//     res.status(status).json({ status, message });
//   }
// });

server.use(router);

server.listen(3333, () => {
  console.log('Run Auth API Server');
});
