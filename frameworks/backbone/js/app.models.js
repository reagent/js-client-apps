var app = app || {};

// Models
app.Model = Backbone.Model.extend({
  errors: {}
});

app.User = app.Model.extend({
  url: '/users',
});

app.Session = app.Model.extend({
  url: '/session'
});

app.Account = app.Model.extend({
  url: '/account',

  token: null,
});

app.Article = app.Model.extend({
  url: '/articles',
});

app.CurrentUser = function() {};

app.CurrentUser.prototype = {

  isLoggedIn: function() {
    return localStorage.currentUserToken !== undefined;
  },

  token: function() {
    return localStorage.currentUserToken;
  },

  logInWith: function(token, onSuccess) {
    localStorage.currentUserToken = token;
    this.trigger('login', "Logged in with token '" + token + "'");

    if (onSuccess) { onSuccess(); }
  }

};

_(app.CurrentUser.prototype).extend(Backbone.Events);