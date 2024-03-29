const Post = require('../models/PostModel')
const Category = require('../models/CategoryModel')
const User = require('../models/UserModel')
const Reply = require('../models/ReplyModel')
const mongoose = require('mongoose')

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

const projectOptionsPostDetails = {
    'author.password': 0, 
    'author.posts': 0, 
    'author.likes': 0, 
    'author.dislikes': 0, 
    'author.saves': 0, 
    'author.followers': 0, 
    'author.following': 0, 
    'category.posts': 0,
}

const projectOptionsPostReplies = {
    'replies.author.password': 0, 
    'replies.author.posts': 0, 
    'replies.author.likes': 0, 
    'replies.author.dislikes': 0, 
    'replies.author.saves': 0, 
    'replies.author.followers': 0, 
    'replies.author.following': 0, 
}

const projectOptionsSavedPost = { 
    'posts.author.password': 0, 
    'posts.author.posts': 0, 
    'posts.author.likes': 0, 
    'posts.author.dislikes': 0, 
    'posts.author.saves': 0, 
    'posts.author.followers': 0, 
    'posts.author.following': 0, 
    'posts.category.posts': 0,
    'posts.replies': 0,
}

const getPostsByFollowingUsers = async (req, res) => {
    const user = req.user;

    const users = await User.findById(user._id).select('following');    
    const usersId = [...users.following, mongoose.Types.ObjectId(user._id)];

    const posts = await Post.aggregate([
        { $match: { 'author': { $in: usersId } } },
        { $lookup: {
            from: 'users', 
            localField: 'author', 
            foreignField: '_id', 
            as: 'author' 
        }},
        { $unwind: '$author' },
        { $lookup: { 
            from: 'categories', 
            localField: 'category', 
            foreignField: '_id', 
            as: 'category' 
        }},
        { $unwind: '$category' },
        { $addFields: {
            'numReplies': { $cond: { if: { $isArray: '$replies' }, then: { $size: '$replies' }, else: 0} },
            'author.postsNumber': { $cond: { if: { $isArray: '$author.posts' }, then: { $size: '$author.posts' }, else: 0} },
            'author.followersNumber': { $cond: { if: { $isArray: '$author.followers' }, then: { $size: '$author.followers' }, else: 0} },
            'author.followingNumber': { $cond: { if: { $isArray: '$author.following' }, then: { $size: '$author.following' }, else: 0} },
        }},
        { $project: projectOptionsPost },
        { $sort: { 'date': -1 } }
    ]) 

    res.status(200).json(posts);
}

const getPostsByCategory = async (req, res) => {
    const { categoryId } = req.params;

    const posts = await Post.aggregate([
        { $match: { $expr: { $eq: ['$category', { $toObjectId: categoryId } ] } } },
        { $lookup: {
            from: 'users', 
            localField: 'author', 
            foreignField: '_id', 
            as: 'author' 
        }},
        { $unwind: '$author' },
        { $lookup: { 
            from: 'categories', 
            localField: 'category', 
            foreignField: '_id', 
            as: 'category' 
        }},
        { $unwind: '$category' },
        { $addFields: {
            'numReplies': { $cond: { if: { $isArray: '$replies' }, then: { $size: '$replies' }, else: 0} },
            'author.postsNumber': { $cond: { if: { $isArray: '$author.posts' }, then: { $size: '$author.posts' }, else: 0} },
            'author.followersNumber': { $cond: { if: { $isArray: '$author.followers' }, then: { $size: '$author.followers' }, else: 0} },
            'author.followingNumber': { $cond: { if: { $isArray: '$author.following' }, then: { $size: '$author.following' }, else: 0} },
        }},
        { $project: projectOptionsPost },
        { $sort: { 'date': -1 } }
    ])

    res.status(200).json(posts);
}

const getMostLikedPosts = async (req, res) => {
    const { timeOption } = req.query;
    const dateFrom = new Date();
    const dateTo = new Date();
    dateFrom.setHours(0,0,0,0)
    dateTo.setHours(23,59,59,999);
    
    if (timeOption === '1') {
        dateFrom.setDate(dateFrom.getDate() - 7);
    } else if (timeOption === '2') {
        dateFrom.setDate(dateFrom.getDate() - 30);
    }

    const posts = await Post.aggregate([
        { $match: { 'date': { $gte: dateFrom, $lte: dateTo } } },
        { $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author'
        }}, 
        { $unwind: '$author' },
        { $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
        }},
        { $unwind: '$category' },
        { $addFields: {
            'author.postsNumber': { $cond: { if: { $isArray: '$author.posts' }, then: { $size: '$author.posts' }, else: 0} },
            'author.followersNumber': { $cond: { if: { $isArray: '$author.followers' }, then: { $size: '$author.followers' }, else: 0} },
            'author.followingNumber': { $cond: { if: { $isArray: '$author.following' }, then: { $size: '$author.following' }, else: 0} },
            'numLikes': { $cond: { if: { $isArray: '$likes' }, then: { $size: '$likes' }, else: 0} },
            'numDislikes': { $cond: { if: { $isArray: '$dislikes' }, then: { $size: '$dislikes' }, else: 0} },
        }},
        { $addFields: {
            'reputation': { $cond: { if: { $lte: ['$numDislikes', { '$multiply': [0.5, '$numLikes'] } ]}, 
                then: { $subtract: ['$numLikes', '$numDislikes']}, 
                else: { $subtract: ['$numLikes', { '$multiply': [1.5, '$numDislikes'] } ]}
            }}
        }},
        { $project: projectOptionsPost },
        { $sort: { 'reputation': -1 } },
        { $limit: 5 }
    ])

    res.status(200).json(posts);
}

const getSavedPosts = async (req, res) => {    
    const user = req.user;

    const postsResponse = await User.aggregate([
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: user._id } ] } } },
        { $lookup: {
            from: 'posts', 
            localField: 'saves', 
            foreignField: '_id', 
            as: 'posts' 
        }},
        { $unwind: '$posts' },
        { $lookup: {
            from: 'users',
            localField: 'posts.author',
            foreignField: '_id',
            as: 'posts.author'
        }}, 
        { $unwind: '$posts.author' },
        { $lookup: {
            from: 'categories',
            localField: 'posts.category',
            foreignField: '_id',
            as: 'posts.category'
        }},
        { $unwind: '$posts.category' },
        { $addFields: {
            'posts.numReplies': { $cond: { if: { $isArray: '$posts.replies' }, then: { $size: '$posts.replies' }, else: 0} },
            'posts.author.postsNumber': { $cond: { if: { $isArray: '$posts.author.posts' }, then: { $size: '$posts.author.posts' }, else: 0} },
            'posts.author.followersNumber': { $cond: { if: { $isArray: '$posts.author.followers' }, then: { $size: '$posts.author.followers' }, else: 0} },
            'posts.author.followingNumber': { $cond: { if: { $isArray: '$posts.author.following' }, then: { $size: '$posts.author.following' }, else: 0} },
        }},
        { $project: projectOptionsSavedPost },
        { $group: {
            '_id': '$_id',
            'posts': { $push: '$posts' },
        }},
        { $sort: { 'date': -1 } }
    ])
    const posts = postsResponse.length > 0 ? postsResponse[0].posts : [];
    res.status(200).json(posts);
}

const createPost = async (req, res) => {
    const post = req.body;
    const user = req.user;

    const newPost = new Post({
        title: post.title,
        body: post.body,
        date: post.date,
        author: user._id,
        category: post.category._id
    })

    const postCreated = await newPost.save();
    await User.findByIdAndUpdate(user._id, { $push: { 'posts': postCreated._id } }, {safe: true, upsert: true, new : true});
    await Category.findByIdAndUpdate(post.category._id, { $push: { 'posts': postCreated._id } }, {safe: true, upsert: true, new : true});

    res.status(201).json(postCreated);
}

const getPost = async (req, res) => {
    const { postId } = req.params;

    const repliesResponse = await Post.aggregate([
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: postId } ] } } },
        { $lookup: {
            from: 'replies', 
            localField: 'replies', 
            foreignField: '_id', 
            as: 'replies' 
        }},
        { $unwind: '$replies' },
        { $lookup: {
            from: 'users',
            localField: 'replies.author',
            foreignField: '_id',
            as: 'replies.author'
        }}, 
        { $unwind: '$replies.author' },
        { $addFields: {
            'replies.author.postsNumber': { $cond: { if: { $isArray: '$replies.author.posts' }, then: { $size: '$replies.author.posts' }, else: 0} },
            'replies.author.followersNumber': { $cond: { if: { $isArray: '$replies.author.followers' }, then: { $size: '$replies.author.followers' }, else: 0} },
            'replies.author.followingNumber': { $cond: { if: { $isArray: '$posrepliests.author.following' }, then: { $size: '$replies.author.following' }, else: 0} },
        }},
        { $project: projectOptionsPostReplies },
        { $group: {
            '_id': '$_id',
            'replies': { $push: '$replies' },
        }},
        { $sort: { 'date': -1 } }
    ])
    const replies = repliesResponse.length > 0 ? repliesResponse[0].replies : [];

    const postUpdated = await Post.aggregate([
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: postId } ] } } },
        { $lookup: {
            from: 'users', 
            localField: 'author', 
            foreignField: '_id', 
            as: 'author' 
        }},
        { $unwind: '$author' },
        { $lookup: { 
            from: 'categories', 
            localField: 'category', 
            foreignField: '_id', 
            as: 'category' 
        }},
        { $unwind: '$category' },
        { $addFields: {
            'numReplies': { $cond: { if: { $isArray: '$replies' }, then: { $size: '$replies' }, else: 0} },
            'author.postsNumber': { $cond: { if: { $isArray: '$author.posts' }, then: { $size: '$author.posts' }, else: 0} },
            'author.followersNumber': { $cond: { if: { $isArray: '$author.followers' }, then: { $size: '$author.followers' }, else: 0} },
            'author.followingNumber': { $cond: { if: { $isArray: '$author.following' }, then: { $size: '$author.following' }, else: 0} },
            'replies': replies
        }},
        { $project: projectOptionsPostDetails },
        { $sort: { 'date': -1 } }
    ])

    res.status(201).json(postUpdated[0]);
}

const likePost = async (req, res) => {
    const post = req.body;
    const user = req.user;

    if (post.likes.includes(user._id)) {
        await Post.findByIdAndUpdate(post._id, { $pull: { 'likes': user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $pull: { 'likes': post._id } }, {safe: true, upsert: true, new : true});
    } else {
        await Post.findByIdAndUpdate(post._id, { $push: { 'likes': user._id }, $pull: { 'dislikes': user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $push: { 'likes': post._id }, $pull: { 'dislikes': post._id } }, {safe: true, upsert: true, new : true});
    }

    const postUpdated = await Post.aggregate([
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: post._id } ] } } },
        { $lookup: {
            from: 'users', 
            localField: 'author', 
            foreignField: '_id', 
            as: 'author' 
        }},
        { $unwind: '$author' },
        { $lookup: { 
            from: 'categories', 
            localField: 'category', 
            foreignField: '_id', 
            as: 'category' 
        }},
        { $unwind: '$category' },
        { $addFields: {
            'numReplies': { $cond: { if: { $isArray: '$replies' }, then: { $size: '$replies' }, else: 0} },
            'author.postsNumber': { $cond: { if: { $isArray: '$author.posts' }, then: { $size: '$author.posts' }, else: 0} },
            'author.followersNumber': { $cond: { if: { $isArray: '$author.followers' }, then: { $size: '$author.followers' }, else: 0} },
            'author.followingNumber': { $cond: { if: { $isArray: '$author.following' }, then: { $size: '$author.following' }, else: 0} },
        }},
        { $project: projectOptionsPost },
        { $sort: { 'date': -1 } }
    ])

    res.status(201).json(postUpdated[0]);
}

const dislikePost = async (req, res) => {
    const post = req.body;
    const user = req.user;

    if (post.dislikes.includes(user._id)) {
        await Post.findByIdAndUpdate(post._id, { $pull: { 'dislikes': user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $pull: { 'dislikes': post._id } }, {safe: true, upsert: true, new : true});
    } else {
        await Post.findByIdAndUpdate(post._id, { $push: { 'dislikes': user._id }, $pull: { 'likes': user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $push: { 'dislikes': post._id }, $pull: { 'likes': post._id } }, {safe: true, upsert: true, new : true});
    }

    const postUpdated = await Post.aggregate([
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: post._id } ] } } },
        { $lookup: {
            from: 'users', 
            localField: 'author', 
            foreignField: '_id', 
            as: 'author' 
        }},
        { $unwind: '$author' },
        { $lookup: { 
            from: 'categories', 
            localField: 'category', 
            foreignField: '_id', 
            as: 'category' 
        }},
        { $unwind: '$category' },
        { $addFields: {
            'numReplies': { $cond: { if: { $isArray: '$replies' }, then: { $size: '$replies' }, else: 0} },
            'author.postsNumber': { $cond: { if: { $isArray: '$author.posts' }, then: { $size: '$author.posts' }, else: 0} },
            'author.followersNumber': { $cond: { if: { $isArray: '$author.followers' }, then: { $size: '$author.followers' }, else: 0} },
            'author.followingNumber': { $cond: { if: { $isArray: '$author.following' }, then: { $size: '$author.following' }, else: 0} },
        }},
        { $project: projectOptionsPost },
        { $sort: { 'date': -1 } }
    ])

    res.status(201).json(postUpdated);
}

const savePost = async (req, res) => {
    const post = req.body;
    const user = req.user;

    if (post.saves.includes(user._id)) {
        await Post.findByIdAndUpdate(post._id, { $pull: { 'saves': user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $pull: { 'saves': post._id } }, {safe: true, upsert: true, new : true});
    } else {
        await Post.findByIdAndUpdate(post._id, { $push: { 'saves': user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $push: { 'saves': post._id } }, {safe: true, upsert: true, new : true});
    }

    const postUpdated = await Post.aggregate([
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: post._id } ] } } },
        { $lookup: {
            from: 'users', 
            localField: 'author', 
            foreignField: '_id', 
            as: 'author' 
        }},
        { $unwind: '$author' },
        { $lookup: { 
            from: 'categories', 
            localField: 'category', 
            foreignField: '_id', 
            as: 'category' 
        }},
        { $unwind: '$category' },
        { $addFields: {
            'numReplies': { $cond: { if: { $isArray: '$replies' }, then: { $size: '$replies' }, else: 0} },
            'author.postsNumber': { $cond: { if: { $isArray: '$author.posts' }, then: { $size: '$author.posts' }, else: 0} },
            'author.followersNumber': { $cond: { if: { $isArray: '$author.followers' }, then: { $size: '$author.followers' }, else: 0} },
            'author.followingNumber': { $cond: { if: { $isArray: '$author.following' }, then: { $size: '$author.following' }, else: 0} },
        }},
        { $project: projectOptionsPost },
        { $sort: { 'date': -1 } }
    ])

    res.status(201).json(postUpdated);
}

const replyPost = async (req, res) => {
    const { postId } = req.params;
    const user = req.user;
    const reply = req.body;

    const newReply = new Reply({
        author: user._id,
        message: reply.message,
        date: reply.date
    })

    const replyCreated = await newReply.save();
    await Post.findByIdAndUpdate(postId, { $push: { 'replies': replyCreated._id } }, {safe: true, upsert: true, new : true});

    const postUpdated = await Post.aggregate([
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: postId } ] } } },
        { $lookup: {
            from: 'users', 
            localField: 'author', 
            foreignField: '_id', 
            as: 'author' 
        }},
        { $unwind: '$author' },
        { $lookup: { 
            from: 'categories', 
            localField: 'category', 
            foreignField: '_id', 
            as: 'category' 
        }},
        { $unwind: '$category' },
        { $addFields: {
            'numReplies': { $cond: { if: { $isArray: '$replies' }, then: { $size: '$replies' }, else: 0} },
            'author.postsNumber': { $cond: { if: { $isArray: '$author.posts' }, then: { $size: '$author.posts' }, else: 0} },
            'author.followersNumber': { $cond: { if: { $isArray: '$author.followers' }, then: { $size: '$author.followers' }, else: 0} },
            'author.followingNumber': { $cond: { if: { $isArray: '$author.following' }, then: { $size: '$author.following' }, else: 0} },
        }},
        { $project: projectOptionsPost },
        { $sort: { 'date': -1 } }
    ])

    res.status(200).json(postUpdated[0]);
}

module.exports = {
    getPostsByFollowingUsers,
    getPostsByCategory,
    getSavedPosts,
    getMostLikedPosts,
    createPost,
    getPost,
    likePost,
    dislikePost,
    savePost,
    replyPost
}