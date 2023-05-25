const { response } = require('express');
const handleErrors = require('../utils/handleErrors');

const Product = require('../models/Products');
const User = require('../models/Users');

const db = require('../database/db');
const { initialData: seedDatabase } = require('../database/seed-data');

// Carga inicial de la data (seed)

const loadSeed = async (req, res = response) => {
    console.log('---> Petición a /api/seed');

    try {
        // Conectamos a la base de datos

        await db.connect();

        try {
            // Insertamos todos los productos
            await Product.deleteMany();
            await Product.insertMany(seedDatabase.products);

            // Insertamos los usuarios
            await User.deleteMany();
            await User.insertMany(seedDatabase.users);

            console.log('---> Seed cargada exitosamente');

            res.status(200).json({
                ok: true,
                message: 'Data cargada exitosamente',
            });
        } catch (error) {
            handleErrors(res, 400, 'ERROR_LOAD_SEED');
        }
    } catch (error) {
        handleErrors(res, 400, 'ERROR_DB');
    } finally {
        await db.disconnect();
    }
};

module.exports = {
    loadSeed,
};
