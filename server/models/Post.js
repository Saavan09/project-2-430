const mongoose = require('mongoose');
const _ = require('underscore');

const setContent = (content) => _.escape(content).trim();

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  content: {
    type: String,
    required: true,
    set: setContent, //trim
  },
  createdDate: {
    type: Date,
    default: Date.now, //sets timestamp to current time when post is created
  },
  isPublic: {
    type: Boolean,
    default: true, //posts are public by default
  },
});

//static method to return a version for api/frontend 
//(og: domoschema)
PostSchema.statics.toAPI = (doc) => ({
  content: doc.content,
  author: doc.author,
  isPublic: doc.isPublic,
  createdDate: doc.createdDate,
});

const PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;
