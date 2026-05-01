const prisma = require('../config/prisma');

const auditLog = (module) => {
  return async (req, res, next) => {
    // Only log mutating actions
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      // Capture the original end function to log after response is sent
      const originalEnd = res.end;

      res.end = async function (chunk, encoding) {
        res.end = originalEnd;
        const response = res.end(chunk, encoding);

        // Only log successful actions
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            await prisma.auditLog.create({
              data: {
                userId: req.user ? req.user.id : 0, // 0 for system/unauth
                action: req.method,
                target: req.originalUrl,
                module: module,
                ipAddress: req.ip || req.headers['x-forwarded-for'] || '0.0.0.0'
              }
            });
          } catch (error) {
            console.error('Audit Log Error:', error);
          }
        }

        return response;
      };
    }
    next();
  };
};

module.exports = auditLog;
