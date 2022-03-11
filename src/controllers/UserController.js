const User = require('../models/UserModel')

const getProfile = async (req, res) => {
    const { username } = req.params;

    const populatePosts = { 
        path: 'posts',
        populate: [
            {
                path: 'author',
                select: '-password -posts -likes -unlikes -saves'
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
                select: '-password -posts -likes -unlikes -saves'
            },
            {
                path: 'category',
                select: '-posts'
            },
        ],
        options: { sort: {date: -1} }
    }
    const populateUnlikes = { 
        path: 'unlikes',
        populate: [
            {
                path: 'author',
                select: '-password -posts -likes -unlikes -saves'
            },
            {
                path: 'category',
                select: '-posts'
            },
        ],
        options: { sort: {date: -1} }
    }

    const user = await User.find({username: username}).populate(populatePosts).populate(populateLikes).populate(populateUnlikes).sort({date: -1}).select('-password');

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

module.exports = {
    getProfile,
    following,
    followUser,
    unfollowUser
}