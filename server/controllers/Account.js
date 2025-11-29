const bcrypt = require('bcrypt');
const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

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

    return res.json({ redirect: '/maker' }); // redirects to main page if signed up correctly
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
    return res.json({ redirect: '/maker' });
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

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  changePassword,
};
