const models = require('../models');

const { Post } = models;

// main page where post list is shown
const feedPage = async (req, res) => res.render('app');

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
    return res.status(201).json(Post.toAPI(newPost));
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
      .populate('author', 'username displayName isPremium') // replace "author" with "username"
      .lean()
      .exec();

    return res.json({ posts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving posts!' });
  }
};

module.exports = {
  feedPage,
  makePost,
  getPosts,
};
