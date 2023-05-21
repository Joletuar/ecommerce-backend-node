const { Router } = require('express');
const { loadSeed } = require('../controllers/seed');

// Creamos el router

const router = Router();

router.post('/', loadSeed);

module.exports = router; // De esta forma se hace un exportación por defecto
