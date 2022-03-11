const express = require('express')
const { getPostsByFollowingUsers, getPostsByCategory, getSavedPosts, getMostLikedPosts, createPost, likePost, dislikePost, savePost } = require('../controllers/PostController')

const router = express.Router();

router.get('/following', getPostsByFollowingUsers);
router.get('/category/:categoryId', getPostsByCategory);
router.get('/saved', getSavedPosts);
router.get('/mostLiked', getMostLikedPosts);
router.post('/add', createPost);
router.post('/like', likePost);
router.post('/dislike', dislikePost);
router.post('/save', savePost);

module.exports = router
