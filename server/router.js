const controllers = require('./controllers');
const mid = require('./middleware');
const upload = require('./middleware/upload');

const router = (app) => {
  // account routes
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  // feed routes
  app.get('/feed', mid.requiresLogin, controllers.Post.feedPage);
  app.post('/post', mid.requiresLogin, controllers.Post.makePost);
  app.get('/getPosts', mid.requiresLogin, controllers.Post.getPosts);
  app.get('/getCurrentUser', mid.requiresLogin, controllers.Post.getCurrentUser);// for ads

  // profile routes
  app.get('/getProfile', mid.requiresLogin, controllers.Account.getProfile);
  app.get('/profile', mid.requiresLogin, controllers.Account.profilePage);
  app.post('/editProfile', mid.requiresLogin, upload.single('profilePic'), controllers.Account.editProfile);

  // premium routes
  app.post('/upgradePremium', mid.requiresLogin, controllers.Account.upgradePremium);
  app.post('/downgradePremium', mid.requiresLogin, controllers.Account.downgradePremium);
  app.get('/premium', mid.requiresLogin, controllers.Account.premiumPage);

  // root
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  // 404 handler for anything nonexistent
  app.use((req, res) => { res.status(404).render('404'); });
};

module.exports = router;
