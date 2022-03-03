const express = require('express')
const { getCategories } = require('../controllers/CategoryController')

const router = express.Router();

router.get('/', getCategories);

module.exports = router
