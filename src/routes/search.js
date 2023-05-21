const { Router } = require('express');
const {
    searchProductsByWord,
    searchNotFound,
} = require('../controllers/search');

const router = Router();

router.get('/:word', searchProductsByWord);

router.get('/', searchNotFound);

module.exports = router;
