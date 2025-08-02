const mongoose = require('mongoose');

class HealthCheckController {
  async check(req, res) {
    try {
      const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mongodb: {
          status: mongoStatus
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }
}

module.exports = HealthCheckController;
