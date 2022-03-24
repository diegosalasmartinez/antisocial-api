const User = require('../models/UserModel')
const Post = require('../models/PostModel')

const projectionOptions = { 
    'author.password': 0, 
    'author.posts': 0, 
    'author.likes': 0, 
    'author.dislikes': 0, 
    'author.saves': 0, 
    'author.followers': 0, 
    'author.following': 0, 
    'category.posts': 0 
}

const projectionOptionsPosts = { 
    'posts.author.password': 0, 
    'posts.author.posts': 0, 
    'posts.author.likes': 0, 
    'posts.author.dislikes': 0, 
    'posts.author.saves': 0, 
    'posts.author.followers': 0, 
    'posts.author.following': 0, 
    'posts.category.posts': 0 
}

const getProfile = async (req, res) => {
    const { username } = req.params;

    const postsResponse = await User.aggregate([
        { $match: { $expr: { $eq: ['$username', username ] } } },
        { $lookup: {
            from: 'posts', 
            localField: 'posts', 
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
        { $project: projectionOptionsPosts },
        { $group: {
            '_id': '$_id',
            'posts': { $push: '$posts' },
        }},
        { $sort: { 'date': -1 } }
    ])
    const likesResponse = await User.aggregate([
        { $match: { $expr: { $eq: ['$username', username ] } } },
        { $lookup: {
            from: 'posts', 
            localField: 'likes', 
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
        { $project: projectionOptionsPosts },
        { $group: {
            '_id': '$_id',
            'posts': { $push: '$posts' },
        }},
        { $sort: { 'date': -1 } }
    ])
    const dislikesResponse = await User.aggregate([
        { $match: { $expr: { $eq: ['$username', username ] } } },
        { $lookup: {
            from: 'posts', 
            localField: 'dislikes', 
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
        { $project: projectionOptionsPosts },
        { $group: {
            '_id': '$_id',
            'posts': { $push: '$posts' },
        }},
        { $sort: { 'date': -1 } }
    ])

    const posts = postsResponse.length > 0 ? postsResponse[0].posts : [];
    const likes = likesResponse.length > 0 ? likesResponse[0].posts : [];
    const dislikes = dislikesResponse.length > 0 ? dislikesResponse[0].posts : [];
    
    const users = await User.aggregate([
        { $match: { $expr: { $eq: ['$username', username ] } } },
        { $addFields: {
            'posts': posts,
            'likes': likes,
            'dislikes': dislikes,
            'postsNumber': posts.length,
            'followersNumber': { $cond: { if: { $isArray: '$followers' }, then: { $size: '$followers' }, else: 0} },
            'followingNumber': { $cond: { if: { $isArray: '$following' }, then: { $size: '$following' }, else: 0} },
        }},
        { $project: projectionOptions },
        { $sort: { 'date': -1 } }
    ])

    res.status(200).json(users);
}

const following = async (req, res) => {
    const user = req.user;
    const userFound = await User.findById(user._id).select('following');
    
    res.status(201).json(userFound);
}

const followUser = async (req, res) => {
    const { userIdToFollow } = req.params;
    const user = req.user;

    const userUpdated = await User.findByIdAndUpdate(user._id, { $push: { "following": userIdToFollow }, $inc: { "followingNumber": 1 }}, {safe: true, upsert: true, new : true}).select('following');
    await User.findByIdAndUpdate(userIdToFollow, { $push: { "followers": user._id }, $inc: { "followersNumber": 1 } }, {safe: true, upsert: true, new : true})
    
    res.status(201).json(userUpdated);
}

const unfollowUser = async (req, res) => {
    const { userIdToFollow } = req.params;
    const user = req.user;

    const userUpdated = await User.findByIdAndUpdate(user._id, { $pull: { "following": userIdToFollow }, $inc: { "followingNumber": -1 }}, {safe: true, upsert: true, new : true}).select('following');
    await User.findByIdAndUpdate(userIdToFollow, { $pull: { "followers": user._id }, $inc: { "followersNumber": -1 } }, {safe: true, upsert: true, new : true})
    
    res.status(201).json(userUpdated);
}

const recommendedUsers = async (req, res) => {
    const dateFrom = new Date();
    dateFrom.setHours(0,0,0,0)
    dateFrom.setDate(dateFrom.getDate() - 7);
    const dateTo = new Date();
    dateTo.setHours(23,59,59,999)

    const posts = await Post.aggregate([
        { $match: { 'date': { $gte: dateFrom, $lte: dateTo } } },
        { $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author'
        }},
        { $unwind: '$author' },
        { $addFields: {
            'numLikes': { $cond: { if: { $isArray: '$likes' }, then: { $size: '$likes' }, else: 0} },
            'numDislikes': { $cond: { if: { $isArray: '$dislikes' }, then: { $size: '$dislikes' }, else: 0} },
        }},
        { $addFields: {
            'reputation': { $cond: { if: { $lte: ['$numDislikes', { '$multiply': [0.5, '$numLikes'] } ]}, 
                then: { $subtract: ['$numLikes', '$numDislikes']}, 
                else: { $subtract: ['$numLikes', { '$multiply': [1.5, '$numDislikes'] } ]}
            }}
        }},
        { $project: projectionOptions },
        { $group: {
            '_id': '$author._id',
            'author': { $first: '$author'},
            'posts': { $push: {
                '_id': '$_id', 
                'title': '$title',
                'reputation': '$reputation'
            }},
        }},
        { $addFields: {
            'totalReputation': { $sum: '$posts.reputation' }
        }},
        { $match: { 'totalReputation': { $gte: 0} } },
        { $project: { 'author': 1 } },
        { $sort: { 'totalReputation': -1 } },
        { $limit: 10 }
    ])
    res.status(200).json(posts);
}

const updateUserInfo = async (req, res) => {
    const { id } = req.params;
    const user = req.body;
    const { name, lastName, description } = user;
    const updatedUser = { name, lastName, description };

    await User.findOneAndUpdate({_id: id}, updatedUser, { new: true });
    res.status(201).json({message: "User updated successfully"});
}


module.exports = {
    getProfile,
    updateUserInfo,
    recommendedUsers,
    following,
    followUser,
    unfollowUser
}