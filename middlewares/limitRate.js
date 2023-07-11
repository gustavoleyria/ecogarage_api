const rateLimit = require("express-rate-limit");

// Establecer límite de solicitudes: 3 solicitudes por minuto
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 3, // Número máximo de solicitudes permitidas en el período establecido
});

module.exports = limiter;
