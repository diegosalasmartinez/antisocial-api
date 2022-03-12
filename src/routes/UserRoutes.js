const express = require('express')
const { getProfile, following, recommendedUsers, followUser, unfollowUser } = require('../controllers/UserController')

const router = express.Router();

router.get('/following', following);
router.get('/recommended-users', recommendedUsers);
router.get('/:username', getProfile);
router.get('/follow/:userIdToFollow', followUser);
router.get('/unfollow/:userIdToFollow', unfollowUser);

module.exports = router
