const { response } = require('express');
const { calculeStatistics } = require('../utils/statistics');
const User = require('../models/Users');
const Order = require('../models/Orders');
const Product = require('../models/Products');
const db = require('../database/db');
const parserFiles = require('../utils/parserFiles');
const { v2: cloudinary } = require('cloudinary');

const getStatistics = async (req, res = response) => {
    console.log('----> Petición a /api/admin/dashboard');

    calculeStatistics()
        .then((values) => {
            return res.status(200).json({
                ok: true,
                statistics: {
                    numberOfOrders: values[0],
                    paidOrders: values[1],
                    notPaidOrders: values[0] - values[1],
                    numberOfClients: values[2],
                    numberOfProducts: values[3],
                    productWithNotInventory: values[4],
                    lowInventory: values[5],
                },
            });
        })
        .catch((error) => {
            return res.status(400).json({
                ok: false,
                message: error.message,
            });
        });
};

const getUsers = async (req, res = response) => {
    console.log('----> Petición a /api/admin/user/getUsers');

    try {
        await db.connect();

        try {
            const users = await User.find().select('-password').lean();

            if (!users) {
                throw new Error('No existen usuarios en registrados todavia');
            }

            return res.status(200).json({
                ok: true,
                users,
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    } finally {
        await db.disconnect();
    }
};

const updateUser = async (req, res = response) => {
    console.log('----> Petición a /api/admin/user/updateUser');

    const { userId = '', rol = '' } = req.body;

    if (!userId || !rol) {
        return res.status(400).json({
            ok: false,
            message: 'El id y rol son campos obligatorios',
        });
    }

    try {
        await db.connect();

        try {
            const userFound = await User.findById(userId);

            if (!userFound) {
                throw new Error('Usuario no encontrado');
            }

            const validRole = ['admin', 'client', 'SEO', 'super-user'];

            if (!validRole.includes(rol)) {
                throw new Error(`Rol no válido: ${validRole}`);
            }

            userFound.role = rol;
            userFound.save();

            return res.status(200).json({
                ok: true,
                message: 'Rol actualizado con éxito',
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    } finally {
        await db.disconnect();
    }
};

const getOrders = async (req, res = response) => {
    console.log('----> Petición a /api/admin/orders/getOrders');

    try {
        await db.connect();

        try {
            const orders = await Order.find()
                .sort({
                    createdAt: 'desc', // Ordenar de manera descendente
                })
                .populate('user', 'name email') // Obtener los valores de otra colección en base a la referencia
                .lean();

            return res.status(200).json({
                ok: true,
                orders,
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    } finally {
        await db.disconnect();
    }
};

const getProducts = async (req, res = response) => {
    console.log('----> Petición a /api/admin/products/getProducts');

    try {
        await db.connect();

        try {
            const products = await Product.find().sort({ title: 'asc' }).lean();

            if (!products) {
                throw new Error('No se encontraron productos');
            }

            const updatedProducts = products.map((producto) => {
                producto.images = producto.images.map((image) => {
                    return image.includes('http')
                        ? image
                        : `${process.env.HOST_NAME}products/${image}`;
                });
                return producto;
            });

            return res.status(200).json({
                ok: true,
                products: updatedProducts,
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    } finally {
        await db.disconnect();
    }
};

const updateProducts = async (req, res = response) => {
    console.log('----> Petición a /api/admin/products/updateProducts');

    const { product = {} } = req.body;

    if (!Object.keys(product).length) {
        return res.status(400).json({
            ok: false,
            message: 'Los datos del producto a actualizar son obligatorios',
        });
    }

    if (product?.images.length < 2) {
        return res.status(400).json({
            ok: false,
            message: 'Mínimo 2 imágenes',
        });
    }

    try {
        await db.connect();

        try {
            // Actualizamos el productos
            const productFound = await Product.findById(product._id);

            if (!productFound) {
                throw new Error('El producto no existe');
            }

            const { images = [] } = product;

            productFound.images.forEach(async (img) => {
                if (!images.includes(img)) {
                    // borrar de cloudrinary

                    const [file_id, extension] = img
                        .substring(img.lastIndexOf('/') + 1)
                        .split('.');

                    // Borrar un imagen de cloudinary
                    await cloudinary.uploader.destroy(file_id);
                }
            });

            const updatedProduct = await Product.findByIdAndUpdate(
                productFound.id,
                product,
                {
                    new: true,
                }
            );

            return res.status(200).json({
                ok: true,
                updatedProduct,
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    } finally {
        await db.disconnect();
    }
};

const addProducts = async (req, res = response) => {
    console.log('----> Petición a /api/admin/products/addProducts');

    const { product = {} } = req.body;

    if (!Object.keys(product).length) {
        return res.status(400).json({
            ok: false,
            message: 'La información del producto no es válida',
        });
    }

    if (product?.images.length < 2) {
        return res.status(400).json({
            ok: false,
            message: 'Mínimo 2 imágenes',
        });
    }

    try {
        await db.connect();

        try {
            const productFound = await Product.findOne({
                slug: product.slug,
            });

            if (productFound) {
                throw new Error('El producto ya existe');
            }

            const newProduct = await Product(product);
            await newProduct.save();

            return res.status(200).json({
                ok: true,
                producto: newProduct,
            });
        } catch (error) {
            return res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    } finally {
        await db.disconnect();
    }
};

const uploadFiles = async (req, res = response) => {
    console.log('----> Petición a /api/admin/upload/uploadFiles');

    // Guardar imagenes en el file system o cloudinary
    try {
        const image_url = await parserFiles(req);

        return res.status(200).json({
            ok: true,
            image_url,
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: error,
        });
    }
};

module.exports = {
    getStatistics,

    // Users
    getUsers,
    updateUser,

    // Orders
    getOrders,

    // Products
    getProducts,
    updateProducts,
    addProducts,

    // Files
    uploadFiles,
};
