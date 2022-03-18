const User = require('../models/UserModel')
const Post = require('../models/PostModel')

const getProfile = async (req, res) => {
    const { username } = req.params;

    const populatePosts = { 
        path: 'posts',
        populate: [
            {
                path: 'author',
                select: '-password -posts -likes -dislikes -saves'
            },
            {
                path: 'category',
                select: '-posts'
            },
        ],
        options: { sort: {date: -1} }
    }
    const populateLikes = { 
        path: 'likes',
        populate: [
            {
                path: 'author',
                select: '-password -posts -likes -dislikes -saves'
            },
            {
                path: 'category',
                select: '-posts'
            },
        ],
        options: { sort: {date: -1} }
    }
    const populateDislikes = { 
        path: 'dislikes',
        populate: [
            {
                path: 'author',
                select: '-password -posts -likes -dislikes -saves'
            },
            {
                path: 'category',
                select: '-posts'
            },
        ],
        options: { sort: {date: -1} }
    }

    const user = await User.find({username: username}).populate(populatePosts).populate(populateLikes).populate(populateDislikes).sort({date: -1}).select('-password');

    res.status(200).json(user);
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

    const projectionOptions = { 'author.password': 0, 'author.posts': 0, 'author.likes': 0, 'author.dislikes': 0, 'author.saves': 0, 'author.followers': 0, 'author.following': 0, 'category.posts': 0 }

    const posts = await Post.aggregate([
        {
            $match: { 'date': { $gte: dateFrom, $lte: dateTo } }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author'
            }
        },
        {
            $unwind: '$author'
        },
        {
            $addFields: {
                'numLikes': { $cond: { if: { $isArray: '$likes' }, then: { $size: '$likes' }, else: 0} },
                'numDislikes': { $cond: { if: { $isArray: '$dislikes' }, then: { $size: '$dislikes' }, else: 0} },
            }
        },
        {
            $addFields: {
                'reputation': { $cond: { if: { $lte: ['$numDislikes', { '$multiply': [0.5, '$numLikes'] } ]}, 
                    then: { $subtract: ['$numLikes', '$numDislikes']}, 
                    else: { $subtract: ['$numLikes', { '$multiply': [1.5, '$numDislikes'] } ]}
                }}
            }
        },
        {
            $project: projectionOptions
        },
        {
            $group: {
                '_id': '$author._id',
                'author': { $first: '$author'},
                'posts': { $push: {
                    '_id': '$_id', 
                    'title': '$title',
                    'reputation': '$reputation'
                }},
            }
        },
        {
            $addFields: {
                'totalReputation': { $sum: '$posts.reputation' }
            }
        },
        {
            $match: { 'totalReputation': { $gte: 0} } 
        },
        {
            $project: { 'author': 1 }
        },
        {
            $sort: { 'totalReputation': -1 }
        },
        {
            $limit: 10
        }
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