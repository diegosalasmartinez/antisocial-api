const Post = require('../models/PostModel')
const User = require('../models/UserModel')

const getPosts = async (req, res) => {
    const posts = await Post.find().populate({ 
        path: 'author',
        select: '-password'
    }).sort({date: -1});
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
    })

    const postCreated = await newPost.save();
    await User.findByIdAndUpdate(user._id, { $push: { "posts": postCreated._id } }, {safe: true, upsert: true, new : true});

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

    await postUpdated.populate({ path: 'author', select: '-password'})
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

    await postUpdated.populate({ path: 'author', select: '-password'})
    res.status(201).json(postUpdated);
}

const savePost = async (req, res) => {
    const post = req.body;
    const user = req.user;

    let postUpdated;

    if (post.likes.includes(user._id)) {
        postUpdated = await Post.findByIdAndUpdate(post._id, { $pull: { "saves": user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $pull: { "saves": postUpdated._id } }, {safe: true, upsert: true, new : true});
    } else {
        postUpdated = await Post.findByIdAndUpdate(post._id, { $push: { "saves": user._id } }, {safe: true, upsert: true, new : true});
        await User.findByIdAndUpdate(user._id, { $push: { "saves": postUpdated._id } }, {safe: true, upsert: true, new : true});
    }

    await postUpdated.populate({ path: 'author', select: '-password'})
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
    getPosts,
    createPost,
    likePost,
    unlikePost,
    savePost
}