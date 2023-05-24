const { response } = require('express');
const Products = require('../models/Products');
const db = require('../database/db');
const { validGenders } = require('../database/constanst');
const handleErrors = require("../utils/handleErrors");

// Obtenemos todos los productos, o los productos basados en un gender

const getProducts = async (req, res = response) => {
    console.log('---> Petición a /api/products');

    // Accediendo al query de la request podemos obtener los query params de la URL
    const { gender = 'all' } = req.query;

    try {
        await db.connect();

        try {
            let condition = {};

            if (gender !== 'all' && validGenders.includes(gender)) {
                condition = { gender };
            }

            const products = await Products.find(condition) // Forma de traer todos los documentos dentro de un bd en mongo
                // .select('title images price inStock slug -_id') // Con esto podemos seleccionar solos los campos del documento, para no traer todos - con el simbolo "-" p|odemos indicar una columna en concreto que no queremos que nos traiga su data
                .select('title images price inStock slug')
                .lean(); // Con el lean traemos información más limpia y ligera

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

            handleErrors(res, 400, "ERROR_GET_PRODUCTS");
        }
    } catch (error) {
        handleErrors(res, 500, "ERROR_DB");
    }finally {
        await db.disconnect();
    }
};

// Obtenemos los productos basados en el slug

const getProductBySlug = async (req, res = response) => {
    console.log('---> Petición a /api/products/:slug');

    // Obtenemos el slug de la url
    // Dentro de los params vienen estos parametros
    const { slug = '' } = req.params;

    if (slug.length <= 0) {
        handleErrors(res, 400, "ERROR_INVALID_SLUG");
    }

    if (slug === 'new') {
        const tempProduct = JSON.parse(JSON.stringify(new Products()));
        delete tempProduct._id;
        tempProduct.images = ['img1.png', 'img2.png'];

        return res.status(200).json({
            ok: true,
            producto: tempProduct,
        });
    }

    try {
        await db.connect();

        try {
            const producto = await Products.findOne({ slug }).lean();

            if (!producto) {
                throw new Error ("Producto no encontrado")
            }

            producto.images = producto.images.map((image) => {
                return image.includes('http')
                    ? image
                    : `${process.env.HOST_NAME}products/${image}`;
            });

            res.status(200).json({
                ok: true,
                producto,
            });
        } catch (error) {
            handleErrors(res, 400, error.message.toUpperCase());
        }
    } catch (error) {
        handleErrors(res, 500, "ERROR_DB");
    }finally {
        await db.disconnect();
    }
};

module.exports = {
    getProducts,
    getProductBySlug,
};
