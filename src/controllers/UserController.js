const User = require('../models/UserModel')

const getProfile = async (req, res) => {
    const { username } = req.params;

    const populatePosts = { 
        path: 'posts',
        populate: {
            path: 'author',
            select: '-password'
        },
        options: { sort: {date: -1} }
    }
    const populateLikes = { 
        path: 'likes',
        populate: {
            path: 'author',
            select: '-password'
        },
        options: { sort: {date: -1} }
    }
    const populateUnlikes = { 
        path: 'unlikes',
        populate: {
            path: 'author',
            select: '-password'
        },
        options: { sort: {date: -1} }
    }

    const user = await User.find({username: username}).populate(populatePosts).populate(populateLikes).populate(populateUnlikes).sort({date: -1}).select('-password');

    res.status(200).json(user);
}

module.exports = {
    getProfile
}