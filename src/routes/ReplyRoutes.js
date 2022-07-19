const express = require('express')
const { likeReply, dislikeReply } = require('../controllers/ReplyController')

const router = express.Router();

router.post('/like', likeReply);
router.post('/dislike', dislikeReply);

module.exports = router
