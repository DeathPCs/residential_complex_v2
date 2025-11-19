const roleAuth = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required.',
                statusCode: 401
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions.',
                statusCode: 403
            });
        }

        next();
    };
};

module.exports = roleAuth;
