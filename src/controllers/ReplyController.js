const Reply = require('../models/ReplyModel')

const projectOptionsPost = { 
    'author.password': 0, 
    'author.posts': 0, 
    'author.likes': 0, 
    'author.dislikes': 0, 
    'author.saves': 0, 
    'author.followers': 0, 
    'author.following': 0, 
    'category.posts': 0,
    'replies': 0,
}

const likeReply = async (req, res) => {
    const reply = req.body;
    const user = req.user;

    if (reply.likes.includes(user._id)) {
        await Reply.findByIdAndUpdate(reply._id, { $pull: { 'likes': user._id } }, {safe: true, upsert: true, new : true});
    } else {
        await Reply.findByIdAndUpdate(reply._id, { $push: { 'likes': user._id }, $pull: { 'dislikes': user._id } }, {safe: true, upsert: true, new : true});
    }

    const replyUpdated = await Reply.aggregate([
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: reply._id } ] } } },
        { $lookup: {
            from: 'users', 
            localField: 'author', 
            foreignField: '_id', 
            as: 'author' 
        }},
        { $unwind: '$author' },
        { $addFields: {
            'author.postsNumber': { $cond: { if: { $isArray: '$author.posts' }, then: { $size: '$author.posts' }, else: 0} },
            'author.followersNumber': { $cond: { if: { $isArray: '$author.followers' }, then: { $size: '$author.followers' }, else: 0} },
            'author.followingNumber': { $cond: { if: { $isArray: '$author.following' }, then: { $size: '$author.following' }, else: 0} },
        }},
        { $project: projectOptionsPost },
        { $sort: { 'date': -1 } }
    ])

    res.status(201).json(replyUpdated[0]);
}

const dislikeReply = async (req, res) => {
    const reply = req.body;
    const user = req.user;

    if (reply.dislikes.includes(user._id)) {
        await Reply.findByIdAndUpdate(reply._id, { $pull: { 'dislikes': user._id } }, {safe: true, upsert: true, new : true});
    } else {
        await Reply.findByIdAndUpdate(reply._id, { $push: { 'dislikes': user._id }, $pull: { 'likes': user._id } }, {safe: true, upsert: true, new : true});
    }

    const replyUpdated = await Reply.aggregate([
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: reply._id } ] } } },
        { $lookup: {
            from: 'users', 
            localField: 'author', 
            foreignField: '_id', 
            as: 'author' 
        }},
        { $unwind: '$author' },
        { $addFields: {
            'author.postsNumber': { $cond: { if: { $isArray: '$author.posts' }, then: { $size: '$author.posts' }, else: 0} },
            'author.followersNumber': { $cond: { if: { $isArray: '$author.followers' }, then: { $size: '$author.followers' }, else: 0} },
            'author.followingNumber': { $cond: { if: { $isArray: '$author.following' }, then: { $size: '$author.following' }, else: 0} },
        }},
        { $project: projectOptionsPost },
        { $sort: { 'date': -1 } }
    ])

    res.status(201).json(replyUpdated[0]);
}

module.exports = {
    likeReply,
    dislikeReply,
}