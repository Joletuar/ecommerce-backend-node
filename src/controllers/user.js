const { response } = require('express');
const User = require('../models/Users');
const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('../utils/jwt');
const validations = require('../utils/validations');
const handleErrors = require("../utils/handleErrors");

const loginUser = async (req, res = response) => {
    console.log('----> Petición a /api/user/login');

    // Obtenemos un query param
    const { q } = req.query;

    // Obtnemos los datos enviados desde el form de front
    const { email, password } = req.body;

    if (!email) {
        handleErrors(res, 400, "ERROR_INVALID_PASSWORD_EMAIL")
    }

    try {
        await db.connect();

        try {
            const userFound = await User.findOne({ email });

            if (!userFound) {
                throw new Error ("El usuario no existe")
            }

            // Si tenemos el query param hacemos solo validación de email, caso contrario se requiere password
            if (!q || q !== 'vEmail') {
                // Comparamos el hash vs el password que se envía desde el front
                if (!bcrypt.compareSync(password, userFound.password)) {
                    handleErrors(res, 400, "ERROR_INVALID_CREDENTIALS")
                }
            }

            const { role, name, _id } = userFound;

            // Generamos el token
            const token = jwt.signtToken(_id, email);

            res.status(200).json({
                ok: true,
                token, //JWT
                user: {
                    _id,
                    email,
                    role,
                    name,
                },
            });
        } catch (error) {
            handleErrors(res, 400, error.message.toUpperCase())
        }
    } catch (error) {
        handleErrors(res, 500, "ERROR_DB")
    }finally {
        await db.disconnect();
    }
};

const registerUser = async (req, res = response) => {
    console.log('----> Petición a /api/user/register');

    // Obtnemos los datos enviados desde el form de front

    let { email, password, name, role = 'client' } = req.body;

    if (!(email && password && name)) {
        handleErrors(res, 400, "ERROR_INVALID_BODY")
    }

    // Verificamos que sea un contraseña válida
    if (password.length < 6 && password !== '@') {
        handleErrors(res, 400, "ERROR_INVALID_LENGTH_PASSWORD")
    }

    // Verificamos que el nombre sea válido
    if (name.length < 3) {
        handleErrors(res, 400, "ERROR_INVALID_LENGTH_NAME")
    }

    if (!validations.isValidEmail(email)) {
        handleErrors(res, 400, "ERROR_INVALID_EMAIL")
    }

    email = email.toLowerCase();

    try {
        await db.connect();

        try {
            // Verificamos que el correo no esté registrado
            const userFound = await User.findOne({ email });

            if (userFound) {
               throw new Error('El correo ya se encuentra registrado')
            }

            // Hasheamos el password enviado desde el front
            const newPassword = bcrypt.hashSync(password);

            // Creamos una nueva instancia del model User
            const user = new User({ email, password: newPassword, name, role });

            // Guardamos la instancia dentro de la bd y obtenemos el documento guardado
            const userRegisterd = await user.save({ validateBeforeSave: true }); // Realizamos validaciones antes de guardar

            // Generamos el token
            const token = jwt.signtToken(
                userRegisterd._id,
                userRegisterd.email
            );

            res.status(200).json({
                ok: true,
                token, //JWT
                user: {
                    _id: userRegisterd._id,
                    email: userRegisterd.email,
                    role: userRegisterd.role,
                    name: userRegisterd.name,
                },
            });
        } catch (error) {
            handleErrors(res, 400, error.message.toUpperCase())
        }
    } catch (error) {
        handleErrors(res, 500, "ERROR_DB")
    }finally {
        await db.disconnect();

    }
};

const checkJWT = async (req, res = response) => {
    console.log('----> Petición a /api/user/validate-token');

    // Obtnemos las cookies a partir de los headers de la request

    const { token } = req.cookies;

    if (!token) {
        handleErrors(res, 400, "ERROR_INVALID_TOKEN")
    }

    let userId = '';

    try {
        userId = await jwt.isValidToken(token);

        try {
            await db.connect();

            const userFound = await User.findById(userId).lean();

            if (!userFound) {
                throw new Error("El usuario no existe")
            }

            const { _id, email, role, name } = userFound;

            const token = jwt.signtToken(_id, email);

            res.status(200).json({
                ok: true,
                token,
                user: {
                    email,
                    role,
                    name,
                },
            });
        } catch (error) {
            handleErrors(res, 400, error.message.toUpperCase())
        }
    } catch (error) {
        handleErrors(res, 500, "ERROR_DB")
    }finally {
        await db.disconnect();

    }
};

module.exports = {
    loginUser,
    registerUser,
    checkJWT,
};
