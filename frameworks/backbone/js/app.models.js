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

  save: function(attributes, options) {
    options = options || {};
    options.headers = options.headers || {}

    options.headers['X-User-Token'] = this.token;

    return Backbone.Model.prototype.save.apply(this, [attributes, options])
  },

  fetch: function(options) {
    options         = options || {};
    options.headers = options.headers || {}

    options.headers['Content-Type'] = 'application/json';
    options.headers['X-User-Token'] = this.token;

    return Backbone.Model.prototype.fetch.apply(this, [options]);
  }
});

app.Article = app.Model.extend({
  url: '/articles',

  save: function(attributes, options) {
    options = options || {};
    options.headers = options.headers || {}

    options.headers['X-User-Token'] = this.token;

    return Backbone.Model.prototype.save.apply(this, [attributes, options])
  }
});