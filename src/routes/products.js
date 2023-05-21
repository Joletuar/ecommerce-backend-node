const { Router } = require('express');
const { getProducts, getProductBySlug } = require('../controllers/products');

const router = Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;
