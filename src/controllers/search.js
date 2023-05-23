const { response } = require('express');
const Products = require('../models/Products');
const db = require('../database/db');

// Obtenemos los productos basados en una palabra

const searchProductsByWord = async (req, res = response) => {
    console.log('----> Petición a /api/search/word');

    // Obtenemos el parámetro de busqueda

    let { word = '' } = req.params;

    if (word.length === 0) {
        return res.status(400).json({
            ok: false,
            message: 'Parámetro de búsqueda no válido',
        });
    }

    try {
        await db.connect();

        try {
            word = word.toLowerCase();

            const products = await Products.find({
                $text: { $search: word }, // Asi se especifica el parámetro de busqueda
            })
                .lean()
                .select('title images price inStock slug -_id');

            await db.disconnect();

            const updatedProducts = products.map((producto) => {
                producto.images = producto.images.map((image) => {
                    return image.includes('http')
                        ? image
                        : `${process.env.HOST_NAME}products/${image}`;
                });
                return producto;
            });

            res.status(200).json({
                ok: true,
                products: updatedProducts,
            });
        } catch (error) {
            await db.disconnect();
            res.status(400).json({
                ok: false,
                message: 'Error recuperar el producto',
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

const searchNotFound = async (req, res = response) => {
    res.status(400).json({
        ok: false,
        message: 'Not Found',
    });
};

module.exports = {
    searchProductsByWord,
    searchNotFound,
};
