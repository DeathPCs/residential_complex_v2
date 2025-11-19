const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../../config/environment');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.',
                statusCode: 401
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token.',
                statusCode: 401
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired.',
                statusCode: 401
            });
        }

        return res.status(401).json({
            success: false,
            error: 'Authentication failed.',
            statusCode: 401
        });
    }
};

module.exports = auth;
