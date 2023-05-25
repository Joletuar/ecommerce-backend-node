const { response } = require('express');
const Products = require('../models/Products');
const db = require('../database/db');
const handleErrors = require('../utils/handleErrors');

// Obtenemos los productos basados en una palabra

const searchProductsByWord = async (req, res = response) => {
    console.log('----> Petición a /api/search/word');

    // Obtenemos el parámetro de busqueda

    let { word = '' } = req.params;

    if (word.length === 0) {
        handleErrors(res, 400, 'ERROR_INVALID_PARAM');
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

            // TODO: comprobar si cuando no encuentra productos se cae o no la petición

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
            handleErrors(res, 400, 'ERROR_SEARCH_PRODUCT');
        }
    } catch (error) {
        handleErrors(res, 500, 'ERROR_BD');
    } finally {
        await db.disconnect();
    }
};

const searchNotFound = async (req, res = response) => {
    handleErrors(res, 404, 'ERROR_NOT_FOUND');
};

module.exports = {
    searchProductsByWord,
    searchNotFound,
};
