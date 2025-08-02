const { Router } = require('express');
const HealthCheckController = require('../controller/HealthCheck');

const router = Router();
const healthCheckController = new HealthCheckController();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica o status da aplicação
 *     tags: [Health Check]
 *     responses:
 *       200:
 *         description: Aplicação está saudável
 *       500:
 *         description: Problemas com a aplicação
 */
router.get('/health', healthCheckController.check.bind(healthCheckController));

module.exports = router;
