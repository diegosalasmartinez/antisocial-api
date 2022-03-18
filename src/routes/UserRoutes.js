const express = require('express')
const { getProfile, following, updateUserInfo, recommendedUsers, followUser, unfollowUser } = require('../controllers/UserController')

const router = express.Router();

router.get('/following', following);
router.get('/recommended-users', recommendedUsers);
router.get('/:username', getProfile);
router.get('/follow/:userIdToFollow', followUser);
router.get('/unfollow/:userIdToFollow', unfollowUser);
router.patch('/:id', updateUserInfo);

module.exports = router
