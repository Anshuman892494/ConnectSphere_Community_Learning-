const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
// @desc    Create a new post
exports.createPost = async (req, res, next) => {
  try {
    const { type, mediaUrl, caption } = req.body;

    const post = await Post.create({
      user: req.user.id,
      type: type || 'text',
      mediaUrl: mediaUrl || '',
      caption,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'username avatar'
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (social feed)
// @route   GET /api/posts
// @access  Private
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar');

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Like or Unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Already liked, so unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like post
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user.id,
      text: req.body.text,
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar');

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the post owner OR is an admin
    const isOwner = post.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    next(error);
  }
};
