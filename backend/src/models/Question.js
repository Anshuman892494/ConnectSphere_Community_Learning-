const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a question title'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Please add details for the question'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    resolved: {
      type: Boolean,
      default: false,
    },
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Question', QuestionSchema);
