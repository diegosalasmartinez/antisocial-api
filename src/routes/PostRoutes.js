const express = require('express')
const { getPosts, createPost, likePost, unlikePost, savePost } = require('../controllers/PostController')

const router = express.Router();

router.get('/', getPosts);
router.post('/add', createPost);
router.post('/like', likePost);
router.post('/unlike', unlikePost);
router.post('/save', savePost);

module.exports = router
