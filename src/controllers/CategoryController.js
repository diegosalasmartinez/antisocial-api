const Category = require('../models/CategoryModel')

const getCategories = async (req, res) => {
    const categories = await Category.find().sort('name');
    res.status(200).json(categories);
}

module.exports = {
    getCategories,
}