const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { type, mediaUrl, caption, description, tags } = req.body;

    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags.map(t => t.trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    const post = await Post.create({
      user: req.user.id,
      type: type || 'text',
      mediaUrl: mediaUrl || '',
      caption,
      description: description || '',
      tags: tagsArray,
      upvotes: [],
      downvotes: [],
      likes: []
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

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Vote a post (upvote / downvote)
// @route   POST /api/posts/:id/vote
// @access  Private
exports.votePost = async (req, res, next) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Initialize arrays if they don't exist
    if (!post.upvotes) post.upvotes = [];
    if (!post.downvotes) post.downvotes = [];

    const upIndex = post.upvotes.indexOf(userId);
    const downIndex = post.downvotes.indexOf(userId);

    if (voteType === 'upvote') {
      if (downIndex > -1) {
        post.downvotes.splice(downIndex, 1);
      }
      if (upIndex > -1) {
        // Toggle off upvote
        post.upvotes.splice(upIndex, 1);
      } else {
        // Toggle on upvote
        post.upvotes.push(userId);
      }
    } else if (voteType === 'downvote') {
      if (upIndex > -1) {
        post.upvotes.splice(upIndex, 1);
      }
      if (downIndex > -1) {
        // Toggle off downvote
        post.downvotes.splice(downIndex, 1);
      } else {
        // Toggle on downvote
        post.downvotes.push(userId);
      }
    }

    // Synchronize likes array with upvotes for compatibility
    post.likes = post.upvotes;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar');

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment from a post
// @route   DELETE /api/posts/:id/comment/:comment_id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find comment
    const comment = post.comments.id(req.params.comment_id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check owner
    const isCommentOwner = comment.user.toString() === req.user.id;
    const isPostOwner = post.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCommentOwner && !isPostOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar');

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};
