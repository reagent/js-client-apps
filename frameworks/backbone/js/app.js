var app = app || {};

app.User = Backbone.Model.extend({
  url: '/users',

  defaults: {
    email:    null,
    username: null
  }
});

app.Session = Backbone.Model.extend({
  url: '/session'
})

app.AppView = Backbone.View.extend({
  el: 'body',

  events: {
    'click #create-user': 'showNewUserForm',
    'click #create-user.opened': 'closeNewUserForm',
    'click #log-in': 'showLoginForm',
    'click #log-in.opened': 'closeLoginForm'
  },

  initialize: function() {
    this.$userFormToggle  = $('#create-user');
    this.$loginFormToggle = $('#log-in');
    this.$formDisplay     = $('#form-display');
  },

  showNewUserForm: function(event) {
    event.preventDefault();
    this.$userFormToggle.addClass('opened');

    var newUserForm = new app.newUserForm();
    this.listenTo(newUserForm, 'close', this.closeNewUserForm);

    this.$formDisplay.html(newUserForm.render().el);
  },

  showLoginForm: function(event) {
    event.preventDefault();
    this.$loginFormToggle.addClass('opened');

    var loginForm = new app.LoginForm();
    this.listenTo(loginForm, 'close', this.closeLoginForm);
    this.$formDisplay.html(loginForm.render().el);
  },

  closeNewUserForm: function() {
    this.$formDisplay.html('');
    this.$userFormToggle.removeClass('opened');
  },

  closeLoginForm: function() {
    this.$formDisplay.html('');
    this.$loginFormToggle.removeClass('opened');
  }

});

app.LoginForm = Backbone.View.extend({
  template: _.template($('#login-form').html()),

  events: {
    'submit form': 'create',
    'click button[type=reset]': 'close'
  },

  create: function(event) {
    event.preventDefault();

    var session = new app.Session();
    var formValues = this.$('form').serializeArray();

    this.listenTo(session, 'sync', this.persistLogin);
    this.listenTo(session, 'error', this.displayErrors);

    _(formValues).each(function(pair) { session.set(pair.name, pair.value); });

    session.save();
  },

  persistLogin: function(model, response) {
    localStorage['userToken'] = response.token;
    this.close();
  },

  displayErrors: function(model, xhr) {
    _(xhr.responseJSON.errors).each(function(error) {
      this.$('.errors').append('<li>' + error + '</li>');
    });
  },

  close: function() {
    this.stopListening();
    this.trigger('close');
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  }
});

app.newUserForm = Backbone.View.extend({
  template: _.template($('#new-user').html()),

  events: {
    'submit form': 'createUser',
    'click button[type=reset]': 'closeForm'
  },

  createUser: function(event) {
    event.preventDefault();

    var user = new app.User();
    var formValues = this.$('form').serializeArray();

    this.listenTo(user, 'error', this.displayErrors);
    this.listenTo(user, 'sync', this.displaySuccess);

    _(formValues).each(function(pair) { user.set(pair.name, pair.value); });

    user.save();
  },

  displayErrors: function(model, xhr) {
    _(xhr.responseJSON.errors).each(function(error) {
      this.$('.errors').append('<li>' + error + '</li>');
    });
  },

  displaySuccess: function(model, resp) {
    alert("Created account for '" + model.get('username') + "'")
    this.closeForm();
  },

  closeForm: function() {
    this.stopListening();
    this.trigger('close');
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  }

});
