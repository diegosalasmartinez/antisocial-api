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

const followUser = async (req, res) => {

}

module.exports = {
    getProfile,
    followUser
}