const { Router } = require('express');
const { loginUser, registerUser, checkJWT } = require('../controllers/user');

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/validate-token', checkJWT);

module.exports = router;
