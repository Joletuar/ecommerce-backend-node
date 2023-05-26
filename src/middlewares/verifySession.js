const handleErrors = require('../utils/handleErrors');
const jwt = require('../utils/jwt');

// Verificamos que exista un token

const verifySession = async (req, res = response, next) => {
    const token = req.headers['x-token'];

    if (!token) {
        handleErrors(res, 401, 'ERROR_NOT_AUTHORIZE');
    }

    try {
        const id = await jwt.isValidToken(token);
        req.id = id;
        next();
    } catch (error) {
        handleErrors(res, 400, error.message.toUpperCase());
    }
};

module.exports = {
    verifySession,
};
