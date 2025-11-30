const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  // account routes
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  // post routes
  app.get('/feed', mid.requiresLogin, controllers.Post.feedPage);
  app.post('/post', mid.requiresLogin, controllers.Post.makePost);
  app.get('/getPosts', mid.requiresLogin, controllers.Post.getPosts);

  // root
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
