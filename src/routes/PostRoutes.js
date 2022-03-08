const express = require('express')
const { getPosts, getSavedPosts, createPost, likePost, unlikePost, savePost } = require('../controllers/PostController')

const router = express.Router();

router.get('/', getPosts);
router.get('/saved', getSavedPosts);
router.post('/add', createPost);
router.post('/like', likePost);
router.post('/unlike', unlikePost);
router.post('/save', savePost);

module.exports = router
