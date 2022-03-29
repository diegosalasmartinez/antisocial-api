const express = require('express')
const { getPostsByFollowingUsers, getPostsByCategory, getSavedPosts, getMostLikedPosts, createPost, getPost, likePost, dislikePost, savePost, replyPost } = require('../controllers/PostController')

const router = express.Router();

router.get('/following', getPostsByFollowingUsers);
router.get('/category/:categoryId', getPostsByCategory);
router.get('/saved', getSavedPosts);
router.get('/mostLiked', getMostLikedPosts);
router.get('/details/:postId', getPost);
router.post('/add', createPost);
router.post('/like', likePost);
router.post('/dislike', dislikePost);
router.post('/save', savePost);
router.post('/reply/:postId', replyPost);

module.exports = router
