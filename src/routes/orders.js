const { Router } = require('express');
const {
    createOrders,
    getOrder,
    gerOrdersByUser,
    payOrder,
} = require('../controllers/orders');
const { verifySession } = require('../middlewares/verifySession');

const router = Router();

router.post('/', verifySession, createOrders);
router.get('/:id', getOrder);
router.get('/user/:id', gerOrdersByUser);
router.post('/pay', payOrder);

module.exports = router;
