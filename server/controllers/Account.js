const bcrypt = require('bcrypt');
const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');
const profilePage = (req, res) => res.render('profile');
const premiumPage = (req, res) => res.render('premium');
const userProfilePage = (req, res) => res.render('userProfile');

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return (Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/feed' }); // redirects to main page if signed up correctly
  }));
};

const signup = async (req, res) => {
  // first, validate the data
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  // attempt to hash the password
  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/feed' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const changePassword = async (req, res) => {
  // user's curent password and new password they want to set
  const currentPass = `${req.body.currentPass}`;
  const newPass = `${req.body.newPass}`;

  if (!currentPass || !newPass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    const account = await Account.findById(req.session.account._id).exec();
    if (!account) {
      return res.status(404).json({ error: 'Account not found!' });
    }

    const match = await bcrypt.compare(currentPass, account.password);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect!' });
    }

    account.password = await Account.generateHash(newPass);
    await account.save();

    return res.json({ success: 'Password successfully changed!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occurred!' });
  }
};

// get the profile info to display on user profile page
const getProfile = async (req, res) => {
  const account = await Account.findById(req.session.account._id).exec();
  if (!account) return res.status(404).json({ error: 'Account not found!' });

  return res.json({
    username: account.username,
    bio: account.bio || '',
    displayName: account.displayName,
    createdDate: account.createdDate,
    isPremium: account.isPremium,
    profilePic: account.profilePic || '/assets/img/default_pfp.png',
    usernameColor: account.usernameColor,
  });
};

// edit the user's profile fields (displayname, bio, pfp, and username color if premium)
const editProfile = async (req, res) => {
  const { displayName, bio, usernameColor } = req.body;

  try {
    const account = await Account.findById(req.session.account._id).exec();
    if (!account) return res.status(404).json({ error: 'Account not found!' });

    // update text fields
    account.displayName = displayName || account.displayName;
    account.bio = bio || account.bio;

    // only for premium
    if (account.isPremium && usernameColor) {
      account.usernameColor = usernameColor;
    }

    // update pfp if new pfp was uploaded
    if (req.file) {
      account.profilePic = `/uploads/${req.file.filename}`;
    }

    await account.save();

    // update session immediately so frontend sees changes
    req.session.account.displayName = account.displayName;
    req.session.account.bio = account.bio;
    if (account.isPremium && usernameColor) {
      req.session.account.usernameColor = account.usernameColor;
    }
    if (req.file) {
      req.session.account.profilePic = account.profilePic;
    }

    return res.json({
      success: true,
      profile: {
        username: account.username,
        displayName: account.displayName,
        bio: account.bio,
        createdDate: account.createdDate,
        isPremium: account.isPremium,
        profilePic: account.profilePic,
        usernameColor: account.usernameColor,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error editing profile!' });
  }
};

const upgradePremium = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id).exec();
    if (!account) return res.status(404).json({ error: 'Account not found!' });

    account.isPremium = true;
    await account.save();

    req.session.account.isPremium = true;

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occurred upgrading your account!' });
  }
};

const downgradePremium = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id).exec();
    if (!account) return res.status(404).json({ error: 'Account not found!' });

    account.isPremium = false;
    await account.save();

    req.session.account.isPremium = false;

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occurred!' });
  }
};

// uploading a pfp
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded!' });
    }

    const account = await Account.findById(req.session.account._id).exec();
    if (!account) return res.status(404).json({ error: 'Account not found!' });

    // save the relative path to mongo
    account.profilePic = `/uploads/${req.file.filename}`;
    await account.save();

    // Update session so frontend can use it immediately
    req.session.account.profilePic = account.profilePic;

    return res.json({ success: true, profilePic: account.profilePic });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error uploading profile picture!' });
  }
};

// get public profile data for a username (for viewing other users' profiles)
const getUserProfile = async (req, res) => {
  try {
    const username = `${req.params.username}`;
    if (!username) return res.status(400).json({ error: 'Username required' });

    const account = await Account.findOne({ username }).exec();
    if (!account) return res.status(404).json({ error: 'User not found' });

    return res.json({
      username: account.username,
      bio: account.bio || '',
      displayName: account.displayName,
      createdDate: account.createdDate,
      isPremium: account.isPremium,
      profilePic: account.profilePic || '/assets/img/default_pfp.png',
      usernameColor: account.usernameColor,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error fetching user profile!' });
  }
};

module.exports = {
  loginPage,
  profilePage,
  premiumPage,
  userProfilePage,
  login,
  logout,
  signup,
  changePassword,
  getProfile,
  editProfile,
  upgradePremium,
  downgradePremium,
  uploadProfilePic,
  getUserProfile,
};
