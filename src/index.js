require('dotenv').config();
const Express = require('express')
const pinoHttp = require('pino-http');
const logger = require('./logger');
const publicRoutes = require('./publicRoutes')
const routes = require('./routes')
const connectDB = require('./infra/mongoose/mongooseConect');
const app = new Express()
const swaggerUi = require('swagger-ui-express');
const swaggerDocs =  require('./swagger')
const UserController = require('./controller/User')
const cors = require('cors')

app.use(Express.json())
app.use(pinoHttp({ logger }));

app.use(cors({
    origin: '*'
}))

app.use(publicRoutes)
app.get('/', (req, res) => {
  req.log.info('Rota raiz acessada');
  res.send('API Bybabnk UP!');
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use((req, res, next) => {
    if (req.url.includes('/docs')) {
        return next();
    }
    const [_, token] = req.headers['authorization']?.split(' ') || []
    const user = UserController.getToken(token)
    if (!user) return res.status(401).json({ message: 'Token inválido' })
    req.user = user
    next()
})
app.use(routes)

connectDB().then(() => {
    app.listen(3000, () => {
        logger.info(`[BYTE BANK: API]: Servidor rodando na porta 3000`);
    });
});


module.exports = app