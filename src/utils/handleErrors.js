const { response } = require('express');

const handleErrors = (res = response, error = 400, message = 'BAD_REQUEST') => {
    return res.status(error).json({
        ok: false,
        message,
    });
};

module.exports = handleErrors;
