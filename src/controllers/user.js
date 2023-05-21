const { response } = require('express');
const User = require('../models/Users');
const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('../utils/jwt');
const validations = require('../utils/validations');

const loginUser = async (req, res = response) => {
    console.log('----> Petición a /api/user/login');

    // Obtenemos un query param
    const { q } = req.query;

    // Obtnemos los datos enviados desde el form de front
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({
            ok: false,
            message: 'El email y password son obligatorios',
        });
    }

    try {
        await db.connect();
        try {
            const userFound = await User.findOne({ email });

            await db.disconnect();

            if (!userFound) {
                return res.status(400).json({
                    ok: false,
                    message: 'El usuario no existe',
                });
            }

            // Si tenemos el query param hacemos solo validación de email, caso contrario se requiere password
            if (!q || q !== 'vEmail') {
                // Comparamos el hash vs el password que se envía desde el front
                if (!bcrypt.compareSync(password, userFound.password)) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Credenciales incorrectas',
                    });
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
            await db.disconnect();
            res.status(400).json({
                ok: false,
                message: 'Error al autenticar el usuario',
            });
        }
    } catch (error) {
        await db.disconnect();
        res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    }
};

const registerUser = async (req, res = response) => {
    console.log('----> Petición a /api/user/register');

    // Obtnemos los datos enviados desde el form de front

    let { email, password, name, role = 'client' } = req.body;

    if (!(email && password && name)) {
        return res.status(400).json({
            ok: false,
            message: 'El email,password y name son obligatorios',
        });
    }

    // Verificamos que sea un contraseña válida
    if (password.length < 6 && password !== '@') {
        return res.status(400).json({
            ok: false,
            message: 'La contraseña debe tener un mínimo de 6 caracteres',
        });
    }

    // Verificamos que el nombre sea válido
    if (name.length < 3) {
        return res.status(400).json({
            ok: false,
            message: 'El nombre debe tener un mínimo de 3 caracteres',
        });
    }

    if (!validations.isValidEmail(email)) {
        return res.status(400).json({
            ok: false,
            message: 'El correo parece ser no válido',
        });
    }

    email = email.toLowerCase();

    try {
        await db.connect();

        try {
            // Verificamos que el correo no esté registrado
            const userFound = await User.findOne({ email });

            if (userFound) {
                await db.disconnect();
                return res.status(400).json({
                    ok: false,
                    message: 'El correo ya se encuentra registrado',
                });
            }

            // Hasheamos el password enviado desde el front
            const newPassword = bcrypt.hashSync(password);

            // Creamos una nueva instancia del model User
            const user = new User({ email, password: newPassword, name, role });

            // Guardamos la instancia dentro de la bd y obtenemos el documento guardado
            const userRegisterd = await user.save({ validateBeforeSave: true }); // Realizamos validaciones antes de guardar

            await db.disconnect();

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
            await db.disconnect();
            res.status(400).json({
                ok: false,
                message: 'Error al registrar el usuario',
            });
        }
    } catch (error) {
        await db.disconnect();
        res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    }
};

const checkJWT = async (req, res = response) => {
    console.log('----> Petición a /api/user/validate-token');

    // Obtnemos las cookies a partir de los headers de la request

    const { token } = req.cookies;

    if (!token) {
        return res.status(400).json({
            ok: false,
            message: 'No se encontró un token en las cookies',
        });
    }

    let userId = '';

    try {
        userId = await jwt.isValidToken(token);

        try {
            await db.connect();

            const userFound = await User.findById(userId).lean();
            await db.disconnect();

            if (!userFound) {
                return res.status(400).json({
                    ok: false,
                    message: 'El usuario no existe',
                });
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
            await db.disconnect();
            res.status(400).json({
                ok: false,
                message: 'Error al revalidar el token',
            });
        }
    } catch (error) {
        res.status(401).json({
            ok: false,
            message: 'Token no válido',
        });
    }
};

module.exports = {
    loginUser,
    registerUser,
    checkJWT,
};
