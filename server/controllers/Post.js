const models = require('../models');

const { Post } = models;

// main page where post list is shown
const feedPage = async (req, res) => {
  // to determine whether or not ads are shown
  const isPremium = req.session.account.isPremium || false;
  return res.render('app', { isPremium });
};

// make new post
const makePost = async (req, res) => {
  const { content } = req.body;
  const { isPublic } = req.body;

  if (!req.body.content) {
    return res.status(400).json({ error: 'Content is required!' });
  }

  const postData = {
    author: req.session.account._id,
    content,
    isPublic,
  };

  try {
    const newPost = new Post(postData);
    await newPost.save();

    await newPost.populate('author', 'username displayName isPremium usernameColor');
    const postResponse = Post.toAPI(newPost);

    return res.status(201).json(postResponse);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured while posting!' });
  }
};

// get the posts visible to the currently logged in account
// all public posts + private posts from this account
const getPosts = async (req, res) => {
  try {
    const query = {
      // mongoose syntax to return posts matching any of these filters
      // so returns posts that are public AND rturns posts made by the current logged in account
      $or: [
        { isPublic: true },
        { author: req.session.account._id },
      ],
    };

    const posts = await Post.find(query) // the search criteria defined earlier
      .sort({ createdDate: -1 }) // to sort the newest first, oldest last
      .populate('author', 'username displayName isPremium profilePic usernameColor') // replace "author" with "username"
      .lean()
      .exec();

    return res.json({ posts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving posts!' });
  }
};

// get if user is premium or not (for ads)
const getCurrentUser = (req, res) => {
  if (!req.session.account) return res.status(401).json({ error: 'Not logged in' });
  return res.json({ isPremium: req.session.account.isPremium });
};

module.exports = {
  feedPage,
  makePost,
  getPosts,
  getCurrentUser,
};
