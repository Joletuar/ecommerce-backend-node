const { response } = require('express');
const jwt = require('../utils/jwt');
const User = require('../models/Users');
const Product = require('../models/Products');
const Order = require('../models/Orders');
const db = require('../database/db');
const paypal = require('../utils/paypal');

const createOrders = async (req, res = response) => {
    console.log('----> Petición a /api/orders/createOrders');

    const { orderItems, total } = req.body;

    // Recuperamos los headers y token
    const headers = req.headers;
    const token = headers['x-token'];

    if (!token) {
        res.status(400).json({
            ok: false,
            message: 'Debe estar logeado para realizar esta operación',
        });
    }

    try {
        await db.connect();

        try {
            const id = await jwt.isValidToken(token);
            const user = await User.findById(id);

            if (!user) {
                throw new Error('El usuario no existe');
            }

            // Creamos un arreglo con los productos que la persona quiere
            const productosId = orderItems.map((product) => product._id);

            // Arreglo con todos los productos que coincidan con nuestro arreglo de ids
            const dbProducts = await Product.find({
                _id: { $in: productosId }, // Se usa esto para buscar con el arreglo de ids
            });

            try {
                // Obtnemos el subotal

                const subtotal = orderItems.reduce(
                    (acumulador, currentProduct) => {
                        // Obtenemos el precio de la bd del item enviado desde el front
                        // Siempre que se trabaje con objetos devueltos por mongoose el _id se debe accesar usando id
                        const currentPrice = dbProducts.find(
                            (prod) => prod.id === currentProduct._id
                        );

                        if (!currentPrice) {
                            throw new Error(
                                'El producto no existe verifique el carrito'
                            );
                        }

                        return (
                            acumulador +
                            currentPrice.price * currentProduct.quantity
                        );
                    },
                    0
                );

                // Obtenemos el impuesto
                const taxes = Number(process.env.TAX_RATE) * subtotal;

                // Total calculado del backend
                const totalBackend = subtotal + taxes;

                // Verificar que los montos cuadren

                if (totalBackend !== total) {
                    throw new Error('Los montos no cuadran');
                }

                // Si todo va bien hacemos la orden
                const newOrder = new Order({
                    ...req.body,
                    isPaid: false,
                    user: user.id,
                });

                // Redondeamos la cantidad
                newOrder.total = Math.round(newOrder.total * 100) / 100;

                // Guardamos la orden
                await newOrder.save();

                res.status(201).json({
                    ok: true,
                    order: newOrder,
                });
            } catch (error) {
                // Los errors lanzados dentro del try serán atrapados por este catch
                console.log(error);

                res.status(400).json({
                    ok: false,
                    message: error.message || 'Revise logs del servidor',
                });
            }
        } catch (error) {
            res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    } finally {
        await db.disconnect();
    }
};

const getOrder = async (req, res = response) => {
    console.log('----> Petición a /api/orders/getOrder');

    // Obtenemos los parametros de la url
    const { id = '' } = req.params;

    if (!id) {
        return res.status(400).json({
            ok: false,
            message: 'Id de orden no válido',
        });
    }

    try {
        await db.connect();

        try {
            const orderFound = await Order.findOne({ _id: id }).lean();
            console.log(orderFound);
            if (!orderFound) {
                throw new Error('La orden no existe');
            }

            res.status(200).json({
                ok: true,
                order: orderFound,
            });
        } catch (error) {
            res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    } finally {
        await db.disconnect();
    }
};

const gerOrdersByUser = async (req, res = response) => {
    console.log('----> Petición a /api/orders/gerOrdersByUser');

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            ok: false,
            message: 'Id de usuario no válido',
        });
    }

    console.log(id);

    try {
        await db.connect();

        try {
            const userFound = await User.findById(id);

            if (!userFound) {
                throw new Error('El usuario no existe');
            }

            const orders = await Order.find({
                user: userFound.id,
            }).lean();

            res.status(200).json({
                ok: true,
                orders: orders ?? [],
            });
        } catch (error) {
            res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Contacte con el soporte',
        });
    } finally {
        await db.disconnect();
    }
};

const payOrder = async (req, res = response) => {
    console.log('---> Peticion a /api/orders/pay');
    // TODO: validar sessión del usuario
    // TODO: Validar mongo id

    // Obtenemos el token de acceso
    const paypalBearerToken = await paypal.getPaypalBearerToken();

    // Si ocurre un error entonces no dejamos continuar
    if (!paypalBearerToken) {
        res.status(400).json({
            ok: false,
            message: 'No se pudo confirmar el token de paypal',
        });
    }

    // Obtenemos el id de la transacción y de la orden
    const { transactionId, orderId } = req.body;

    // Hacemos una petición a paypal para obtener info sobre la order
    const respuesta = await fetch(
        `${process.env.PAYPAL_ORDERS_URL}/${transactionId}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${paypalBearerToken}`,
            },
        }
    );

    const data = await respuesta.json();

    // Si la orden no esta completa retornamos error
    if (data?.status !== 'COMPLETED') {
        return res.status(200).json({
            ok: false,
            message: 'Orden no válida',
        });
    }

    try {
        await db.connect();

        try {
            // Veirificamos que la orden generada exista en la BD
            const dbOrder = await Order.findById(orderId);

            if (!dbOrder) {
                throw new Error('Orden no existente en BD');
            }

            // Si el monto de la orden de la BD no coincide con el monto de la orden que nos retorna paypal, lanzamos error
            if (dbOrder.total !== Number(data.purchase_units[0].amount.value)) {
                throw new Error(
                    'Los montos de paypal y nuestra base no coinciden'
                );
            }

            // Cambiamos el id de la transacción por el que envia el front
            dbOrder.transactionId = transactionId;

            // Cambiamos el estado de la orden a pagada
            dbOrder.isPaid = true;

            await dbOrder.save();

            res.status(200).json({
                ok: true,
                message: 'Orden Pagada',
            });
        } catch (error) {
            res.status(400).json({
                ok: false,
                message: error.message,
            });
        }
    } catch (error) {
        res.status(500).json({
            ok: true,
            message: 'Contacte con el soporte',
        });
    } finally {
        await db.disconnect();
    }
};

module.exports = { createOrders, getOrder, gerOrdersByUser, payOrder };
