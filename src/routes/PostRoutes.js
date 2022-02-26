const express = require('express')
const { getPosts, getProfile, createPost, likePost, unlikePost } = require('../controllers/PostController')

const router = express.Router();

router.get('/', getPosts);
router.get('/:username', getProfile);
router.post('/add', createPost);
router.post('/like', likePost);
router.post('/unlike', unlikePost);
// router.patch('/:id', updateSpecialty);
// router.post('/delete/:id', deleteSpecialty);

module.exports = router
