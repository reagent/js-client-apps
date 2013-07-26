// Collections

app.Articles = Backbone.Collection.extend({
  url: '/articles',
  model: app.Article
});
