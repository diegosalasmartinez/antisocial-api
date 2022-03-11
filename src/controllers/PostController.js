const Post = require('../models/PostModel')
const Category = require('../models/CategoryModel')
const User = require('../models/UserModel')

const getPostsByFollowingUsers = async (req, res) => {
    const user = req.user;

    const users = await User.findById(user._id).select('following');    
    const usersId = users.following;
    
    const posts = await Post.find({ author: { $in: usersId } }).populate({ 
        path: 'author',
        select: '-password -posts -likes -unlikes -saves -followers -following'
    }).populate({ path: 'category', select: '-posts' }).sort({date: -1});
    res.status(200).json(posts);
}

const getPostsByCategory = async (req, res) => {
    const { categoryId } = req.params;
    
    const posts = await Post.find({ category: categoryId}).populate({ 
        path: 'author',
        select: '-password -posts -likes -unlikes -saves -followers -following'
    }).populate({ path: 'category', select: '-posts' }).sort({ date: -1 });
    res.status(200).json(posts);
}

const getSavedPosts = async (req, res) => {    
    const user = req.user;
    const populateSavedPosts = { 
        path: 'saves',
        populate: [
            {
                path: 'author',
                select: '-password -posts -likes -unlikes -saves -followers -following'
            },
            {
                path: 'category',
                select: '-posts'
            },
        ],
        options: { sort: {date: -1} }
    }

    const users = await User.find({_id: user._id}).populate(populateSavedPosts).sort({date: -1}).select('-password');
    const posts = users[0].saves;

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
    await User.findByIdAndUpdate(user._id, { $push: { "posts": postCreated._id }, $inc: { "postsNumber": 1 } }, {safe: true, upsert: true, new : true});
    await Category.findByIdAndUpdate(post.category._id, { $push: { "posts": postCreated._id } }, {safe: true, upsert: true, new : true});

    res.status(201).json(postCreated);
}

const likePost = async (req, res) => {
    const post = req.body;
    const user = req.user;

    let postUpdated;

    if (post.likes.includes(user._id)) {
        postUpdated = await Post.findByIdAndUpdate(post._id, { $pull: { "likes": user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $pull: { "likes": postUpdated._id } }, {safe: true, upsert: true, new : true});
    } else {
        postUpdated = await Post.findByIdAndUpdate(post._id, { $push: { "likes": user._id }, $pull: { "unlikes": user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $push: { "likes": postUpdated._id }, $pull: { "unlikes": postUpdated._id } }, {safe: true, upsert: true, new : true});
    }

    await postUpdated.populate([{ path: 'author', select: '-posts -followers -following -password'},{ path: 'category', select: '-posts' } ]);
    res.status(201).json(postUpdated);
}

const unlikePost = async (req, res) => {
    const post = req.body;
    const user = req.user;

    let postUpdated;

    if (post.unlikes.includes(user._id)) {
        postUpdated = await Post.findByIdAndUpdate(post._id, { $pull: { "unlikes": user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $pull: { "unlikes": postUpdated._id } }, {safe: true, upsert: true, new : true});
    } else {
        postUpdated = await Post.findByIdAndUpdate(post._id, { $push: { "unlikes": user._id }, $pull: { "likes": user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $push: { "unlikes": postUpdated._id }, $pull: { "likes": postUpdated._id } }, {safe: true, upsert: true, new : true});
    }

    await postUpdated.populate([{ path: 'author', select: '-posts -followers -following -password'},{ path: 'category', select: '-posts' } ]);
    res.status(201).json(postUpdated);
}

const savePost = async (req, res) => {
    const post = req.body;
    const user = req.user;

    let postUpdated;

    if (post.saves.includes(user._id)) {
        postUpdated = await Post.findByIdAndUpdate(post._id, { $pull: { "saves": user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $pull: { "saves": postUpdated._id } }, {safe: true, upsert: true, new : true});
    } else {
        postUpdated = await Post.findByIdAndUpdate(post._id, { $push: { "saves": user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $push: { "saves": postUpdated._id } }, {safe: true, upsert: true, new : true});
    }

    await postUpdated.populate([{ path: 'author', select: '-posts -followers -following -password'},{ path: 'category', select: '-posts' } ]);
    res.status(201).json(postUpdated);
}

const updateSpecialty = async (req, res) => {
    // const { id } = req.params;
    // const specialty = req.body;
    // const { code, name } = specialty;
    // const updatedSpecialty = { code, name };

    // await Specialty.findOneAndUpdate({_id: id}, updatedSpecialty, { new: true });
    // res.status(201).json({message: "Specialty updated successfully"});
}

const deleteSpecialty = async (req, res) => {
    // const { id } = req.params;
    // const updatedSpecialty = { active: false }; 

    // await Specialty.findOneAndUpdate({_id: id}, updatedSpecialty, { new: true });
    // res.status(200).json({message: "Specialty deleted successfully"});
}

module.exports = {
    getPostsByFollowingUsers,
    getPostsByCategory,
    getSavedPosts,
    createPost,
    likePost,
    unlikePost,
    savePost
}