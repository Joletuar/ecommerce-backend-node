const verifySession = async (req, res = response, next) => {
    const token = req.headers['x-token'];

    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'No autorizado',
        });
    }
    next();
};

module.exports = {
    verifySession,
};
