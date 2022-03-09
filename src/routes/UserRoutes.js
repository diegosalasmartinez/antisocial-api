const express = require('express')
const { getProfile, followUser } = require('../controllers/UserController')

const router = express.Router();

router.get('/:username', getProfile);
router.get('/follow/:username', followUser);

module.exports = router
