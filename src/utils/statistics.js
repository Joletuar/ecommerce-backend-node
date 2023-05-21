const Orders = require('../models/Orders');
const Users = require('../models/Users');
const Products = require('../models/Products');
const db = require('../database/db');

const calculeStatistics = async () => {
    try {
        await db.connect();

        // try {
        // const numberOfOrders = await Orders.estimatedDocumentCount();
        // const paidOrders = await Orders.find({ isPaid: true }).length;
        // const notPaidOrders = numberOfOrders - paidOrders;

        // const numberOfClients = await Users.estimatedDocumentCount();

        // const numberOfProducts = await Products.estimatedDocumentCount();
        // const productWithNotInventory = await Products.where('inStock').lte(
        //     0
        // );

        // const lowInventory = await Products.where('inStock').lte(10);

        return Promise.all([
            Orders.estimatedDocumentCount(),
            Orders.find({ isPaid: true }).count(),
            Users.find({ role: 'client' }).count(),
            Products.estimatedDocumentCount(),
            Products.where('inStock').lte(0).count(),
            Products.where('inStock').lte(10).count(),
        ]);
    } catch (error) {
        return { ok: false, message: 'Contacte con el soporte' };
    } finally {
        await db.disconnect();
    }
};

module.exports = {
    calculeStatistics,
};
