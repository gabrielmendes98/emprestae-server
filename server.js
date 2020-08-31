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

function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
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

server.use(router);

server.listen(3333, () => {
  console.log('Run Auth API Server');
});
