const jwt = require('jsonwebtoken');

// Función encargada de firmar/generar los tokens
const signtToken = (_id, email) => {
    const semilla = process.env.SECRET_JWT_SEDD;

    if (!semilla) {
        throw new Error('No hay semilla de JWT, revisar variables de entorno');
    }

    // Con esto genermos el jwt
    return jwt.sign(
        // Definimos el payload
        {
            email,
            _id,
        },
        // Definimos la semilla con la que se hará en hasheo
        semilla,
        // Opciones adicionales
        {
            expiresIn: '15d', // Opción que especifica que el tiempo que durará el token antes de que expire
        }
    );
};

// Función de validación de JWT
const isValidToken = (token) => {
    const semilla = process.env.SECRET_JWT_SEDD;

    if (!semilla) {
        throw new Error('No hay semilla de JWT, revisar variables de entorno');
    }

    return new Promise((resolve, reject) => {
        try {
            // Validamos el token que viene de las cookies
            jwt.verify(token, semilla, (err, payload) => {
                if (err) return reject('El JWT no es válido');

                // Obtenemos el id del payload del token
                const { _id } = payload;

                resolve(_id);
            });
        } catch (error) {
            reject('El JWT no es válido');
        }
    });
};

module.exports = {
    signtToken,
    isValidToken,
};
