const { Router } = require('express');
const {
    getStatistics,
    getUsers,
    updateUser,
    getOrders,
    getProducts,
    updateProducts,
    addProducts,
    uploadFiles,
} = require('../controllers/admin');
const { verifySession } = require('../middlewares/verifySession');

const router = Router();

router.get('/dashboard', verifySession, getStatistics);

router.get('/users', verifySession, getUsers);
router.put('/users', verifySession, updateUser);

router.get('/orders', verifySession, getOrders);

router.get('/products', verifySession, getProducts);
router.put('/products', verifySession, updateProducts);
router.post('/products', verifySession, addProducts);

router.post('/upload', verifySession, uploadFiles);

module.exports = router;
