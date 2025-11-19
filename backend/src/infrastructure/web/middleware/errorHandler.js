const { NODE_ENV } = require('../../../../config/environment');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error(err);

    // Default error
    if (!error.statusCode) {
        error.statusCode = 500;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        statusCode: error.statusCode || 500,
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
